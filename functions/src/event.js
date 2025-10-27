const { onRequest } = require("firebase-functions/v2/https");
const admin = require("firebase-admin");
const cors = require("cors")({ origin: true });

exports.createEvent = onRequest((req, res) => {
  cors(req, res, async () => {
    try {
      // ✅ Only allow POST requests
      if (req.method !== "POST") {
        return res.status(405).send("Method Not Allowed");
      }

      const {
        title,
        summary,
        start,
        street, suburb, state,
        image,
        lat, lng,
        attendance
      } = req.body;

      // ✅ Validate required fields
      if (!title || !summary || !start || !street || !suburb || !state) {
        return res.status(400).send("Missing required fields: title, summary, start, location");
      }

      // ✅ Validate image URL (basic)
      if (image && !/^https?:\/\/.+/.test(image)) {
        return res.status(400).send("Invalid image URL");
      }

      const eventData = {
        title,
        summary,
        start: admin.firestore.Timestamp.fromDate(new Date(start)),
        street, suburb, state,
        image: image || "",
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        lat: lat, lng: lng,
        attendance
      };

      // ✅ Save to Firestore
      const ref = await admin.firestore().collection("events").add(eventData);

      res.status(200).send({
        success: true,
        id: ref.id,
        message: "Event created successfully.",
      });
    } catch (error) {
      console.error("🔥 Error creating event:", error);
      res.status(500).send({
        success: false,
        message: "Error creating event: " + error.message,
      });
    }
  });
});

exports.getRecentEvents = onRequest((req, res) => {
  cors(req, res, async () => {
    try {
      const eventsRef = admin.firestore().collection('events');
      const snapshot = await eventsRef
          .orderBy('start', 'desc')
          .limit(3)
          .get();

      const events = snapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          start: data.start.toDate().toISOString(),
        };
      });

      res.status(200).send({ success: true, events });
    } catch (error) {
      console.error('🔥 Error fetching recent events:', error);
      res.status(500).send({
        success: false,
        message: 'Error fetching events: ' + error.message,
      });
    }
  });
});

exports.registerForEvent = onRequest((req, res) => {
  cors(req, res, async () => {
    try {
      if (req.method !== "POST") {
        return res.status(405).send("Method Not Allowed");
      }

      const { eventId, uid, email } = req.body;
      if (!eventId || !uid || !email) {
        return res.status(400).send("Missing eventId, uid, or email");
      }

      const regRef = admin
          .firestore()
          .collection("events")
          .doc(eventId)
          .collection("registrations")
          .doc(uid);

      await regRef.set({
        uid,
        email,
        registeredAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      res.status(200).send({ success: true, message: "User registered successfully" });
    } catch (error) {
      console.error("🔥 Error registering:", error);
      res.status(500).send({ success: false, message: error.message });
    }
  });
});

exports.rateEvent = onRequest((req, res) => {
  cors(req, res, async () => {
    try {
      if (req.method !== "POST") {
        return res.status(405).send({ success: false, message: "Method Not Allowed" });
      }

      const { eventId, uid, rating } = req.body;
      if (!eventId || !uid || typeof rating !== "number") {
        return res.status(400).send({ success: false, message: "Missing eventId, uid or rating" });
      }

      const db = admin.firestore();
      const eventRef = db.collection("events").doc(eventId);
      const eventDoc = await eventRef.get();

      if (!eventDoc.exists) {
        return res.status(404).send({ success: false, message: "Event not found" });
      }

      // Use subcollection to store user ratings (1 per user)
      const userRatingRef = eventRef.collection("ratings").doc(uid);
      const userRatingDoc = await userRatingRef.get();

      if (userRatingDoc.exists) {
        return res.status(400).send({ success: false, message: "User already rated this event." });
      }

      // Save the user's rating
      await userRatingRef.set({
        rating,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      // Recalculate average rating from all ratings in subcollection
      const allRatingsSnap = await eventRef.collection("ratings").get();
      const ratings = allRatingsSnap.docs.map((doc) => doc.data().rating);
      const avgRating = ratings.reduce((a, b) => a + b, 0) / ratings.length;

      // Update the event document
      await eventRef.update({
        avgRating,
        ratingCount: ratings.length,
      });

      res.status(200).send({
        success: true,
        avgRating,
        ratingCount: ratings.length,
        message: "Rating submitted successfully.",
      });
    } catch (error) {
      console.error("🔥 Error rating event:", error);
      res.status(500).send({ success: false, message: error.message });
    }
  });
});

exports.getEventRating = onRequest((req, res) => {
  cors(req, res, async () => {
    try {
      const eventId = req.query.eventId;
      const uid = req.query.uid; // optional
      if (!eventId) {
        return res.status(400).send({ success: false, message: "Missing eventId" });
      }

      const db = admin.firestore();
      const eventRef = db.collection("events").doc(eventId);
      const doc = await eventRef.get();

      if (!doc.exists) {
        return res.status(404).send({ success: false, message: "Event not found" });
      }

      const data = doc.data();
      let userRating = null;

      if (uid) {
        const userRatingDoc = await eventRef.collection("ratings").doc(uid).get();
        if (userRatingDoc.exists) {
          userRating = userRatingDoc.data().rating;
        }
      }

      res.status(200).send({
        success: true,
        avgRating: data.avgRating || 0,
        ratingCount: data.ratingCount || 0,
        userRating: userRating,
      });
    } catch (error) {
      console.error("🔥 Error fetching rating:", error);
      res.status(500).send({ success: false, message: error.message });
    }
  });
});

exports.deleteEvent = onRequest((req, res) => {
  cors(req, res, async () => {
    try {
      // ✅ Allow only POST requests
      if (req.method !== "POST") {
        return res.status(405).send({ success: false, message: "Method Not Allowed" });
      }

      const { eventId } = req.body;
      if (!eventId) {
        return res.status(400).send({ success: false, message: "Missing eventId" });
      }

      const db = admin.firestore();
      const eventRef = db.collection("events").doc(eventId);

      // ✅ Check if event exists
      const eventSnap = await eventRef.get();
      if (!eventSnap.exists) {
        return res.status(404).send({ success: false, message: "Event not found" });
      }

      // ✅ Delete nested subcollections (registrations, ratings)
      const subcollections = await eventRef.listCollections();
      for (const sub of subcollections) {
        const subDocs = await sub.listDocuments();
        for (const doc of subDocs) {
          await doc.delete();
        }
      }

      // ✅ Delete main event document
      await eventRef.delete();

      console.log(`🗑️ Event ${eventId} deleted successfully`);
      return res.status(200).send({
        success: true,
        message: `Event ${eventId} deleted successfully.`,
      });
    } catch (error) {
      console.error("🔥 Error deleting event:", error);
      return res.status(500).send({
        success: false,
        message: "Error deleting event: " + error.message,
      });
    }
  });
});

exports.registerOrAttendEvent = onRequest((req, res) => {
  cors(req, res, async () => {
    try {
      if (req.method !== "POST") {
        return res.status(405).send("Method Not Allowed");
      }

      const { eventId, uid, email, action } = req.body;
      if (!eventId || !uid || !email || !action) {
        return res.status(400).send({
          success: false,
          message: "Missing eventId, uid, email, or action",
        });
      }

      const db = admin.firestore();
      const eventRef = db.collection("events").doc(eventId);
      const regRef = eventRef.collection("registrations").doc(uid);

      // Check if the registration already exists
      const regSnap = await regRef.get();

      if (action === "register") {
        if (regSnap.exists) {
          return res.status(400).send({
            success: false,
            message: "User already registered for this event",
          });
        }

        // Create registration
        await regRef.set({
          uid,
          email,
          status: "registered",
          registeredAt: admin.firestore.FieldValue.serverTimestamp(),
        });

        // Increment event "interest" count
        await eventRef.set(
            { interest: admin.firestore.FieldValue.increment(1) },
            { merge: true }
        );


        return res.status(200).send({
          success: true,
          message: "User registered successfully",
          status: "registered",
        });
      }

      if (action === "attend") {
        if (!regSnap.exists) {
          return res.status(400).send({
            success: false,
            message: "User is not registered for this event",
          });
        }

        const currentData = regSnap.data();
        if (currentData.status === "attended") {
          return res.status(400).send({
            success: false,
            message: "User already marked attendance",
          });
        }

        // Mark attendance
        await regRef.update({
          status: "attended",
          attendedAt: admin.firestore.FieldValue.serverTimestamp(),
        });

        // Increment attendance field
        await eventRef.set(
            { attendance: admin.firestore.FieldValue.increment(1) },
            { merge: true }
        );

        return res.status(200).send({
          success: true,
          message: "Attendance marked successfully",
          status: "attended",
        });
      }

      res.status(400).send({ success: false, message: "Invalid action" });
    } catch (error) {
      console.error("🔥 Error registering/attending event:", error);
      res.status(500).send({
        success: false,
        message: "Error registering or marking attendance: " + error.message,
      });
    }
  });
});

exports.getEventRegistrationStatus = onRequest((req, res) => {
  cors(req, res, async () => {
    try {
      const { eventId, uid } = req.body;
      if (!eventId || !uid) return res.status(400).send({ success: false, message: "Missing fields" });

      const regRef = admin
          .firestore()
          .collection("events")
          .doc(eventId)
          .collection("registrations")
          .doc(uid);

      const regSnap = await regRef.get();
      if (!regSnap.exists) return res.status(200).send({ success: true, status: null });

      res.status(200).send({
        success: true,
        status: regSnap.data().status,
      });
    } catch (error) {
      res.status(500).send({ success: false, message: error.message });
    }
  });
});

exports.populateMockEvents = onRequest((req, res) => {
  cors(req, res, async () => {
    try {
      const db = admin.firestore();
      const eventsRef = db.collection("events");

      // ✅ Delete all existing events
      const existing = await eventsRef.listDocuments();
      for (const doc of existing) await doc.delete();
      console.log(`🗑️ Deleted ${existing.length} old events.`);

      const today = new Date();
      const mockEvents = [];
      const suburbs = [
        "Clayton",
        "Glen Waverley",
        "Richmond",
        "Docklands",
        "Carlton",
        "St Kilda",
      ];

      // Helper to format dates relative to today
      // eslint-disable-next-line require-jsdoc, no-inner-declarations
      function addDays(days) {
        const d = new Date(today);
        d.setDate(today.getDate() + days);
        return d;
      }

      for (let i = -5; i <= 5; i++) {
        const startDate = addDays(i);
        const suburb = suburbs[Math.floor(Math.random() * suburbs.length)];
        const attendance = Math.floor(Math.random() * 30);
        const interest = attendance + Math.floor(Math.random() * 10);
        const lat = -37.8 + Math.random() * 0.1;
        const lng = 144.9 + Math.random() * 0.1;

        mockEvents.push({
          title: i === 0 ? "Community Meet" : `Mock Event ${i + 6}`,
          summary: i === 0 ? "Today's big social meet for all members!" : "A casual community event featuring pool, snacks, and socializing.",
          start: admin.firestore.Timestamp.fromDate(startDate),
          street: `${10 + Math.floor(Math.random() * 100)} Main St`,
          suburb,
          state: "VIC",
          image: "",
          lat,
          lng,
          attendance,
          interest,
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
        });
      }

      // ✅ Batch add mock events
      const batch = db.batch();
      mockEvents.forEach((e) => {
        const ref = eventsRef.doc();
        batch.set(ref, e);
      });

      await batch.commit();

      console.log(`✅ Added ${mockEvents.length} mock events.`);
      res.status(200).send({
        success: true,
        message: `${mockEvents.length} mock events created.`,
      });
    } catch (error) {
      console.error("🔥 Error populating mock events:", error);
      res.status(500).send({
        success: false,
        message: "Error populating mock events: " + error.message,
      });
    }
  });
});

exports.getUpcomingEvents = onRequest((req, res) => {
  cors(req, res, async () => {
    try {
      const db = admin.firestore();
      const now = new Date();

      const snapshot = await db
          .collection("events")
          .where("start", ">=", admin.firestore.Timestamp.fromDate(now))
          .orderBy("start", "asc")
          .limit(5)
          .get();

      if (snapshot.empty) {
        return res.status(200).json({ success: true, events: [] });
      }

      const events = snapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          start: data.start.toDate().toISOString(),
        };
      });

      return res.status(200).json({
        success: true,
        events,
      });
    } catch (error) {
      console.error("🔥 Error fetching upcoming events:", error);
      return res.status(500).json({
        success: false,
        message: "Error fetching upcoming events: " + error.message,
      });
    }
  });
});

exports.getPastEvents = onRequest((req, res) => {
  cors(req, res, async () => {
    try {
      const db = admin.firestore();
      const now = new Date();

      const snapshot = await db
          .collection("events")
          .where("start", "<", admin.firestore.Timestamp.fromDate(now))
          .orderBy("start", "desc")
          .limit(5)
          .get();

      if (snapshot.empty) {
        return res.status(200).json({ success: true, events: [] });
      }

      const events = snapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          start: data.start.toDate().toISOString(),
        };
      });

      return res.status(200).json({
        success: true,
        events,
      });
    } catch (error) {
      console.error("🔥 Error fetching past events:", error);
      return res.status(500).json({
        success: false,
        message: "Error fetching past events: " + error.message,
      });
    }
  });
});


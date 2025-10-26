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

      // Example Melbourne-based mock data
      const locations = [
        { street: "123 Lygon St", suburb: "Carlton", state: "VIC", lat: -37.8002, lng: 144.966 },
        { street: "45 Swanston St", suburb: "Melbourne", state: "VIC", lat: -37.818, lng: 144.967 },
        { street: "78 Chapel St", suburb: "Prahran", state: "VIC", lat: -37.851, lng: 144.993 },
        { street: "12 Glenferrie Rd", suburb: "Hawthorn", state: "VIC", lat: -37.821, lng: 145.035 },
        { street: "90 Bay St", suburb: "Port Melbourne", state: "VIC", lat: -37.839, lng: 144.94 },
      ];

      const now = new Date();

      const mockEvents = [];

      // Create 5 past events (within the last 10 days)
      for (let i = 0; i < 5; i++) {
        const date = new Date(now);
        date.setDate(now.getDate() - (i + 2)); // 2–6 days ago
        const loc = locations[i % locations.length];

        mockEvents.push({
          title: `Past Event ${i + 1}`,
          summary: `A fun past event held recently in ${loc.suburb}.`,
          start: admin.firestore.Timestamp.fromDate(date),
          street: loc.street,
          suburb: loc.suburb,
          state: loc.state,
          lat: loc.lat,
          lng: loc.lng,
          image: "",
          attendance: Math.floor(Math.random() * 30) + 10, // 10–40
          interest: Math.floor(Math.random() * 50) + 20, // 20–70
          avgRating: +(Math.random() * 2 + 3).toFixed(1), // 3.0–5.0
          ratingCount: Math.floor(Math.random() * 10) + 1,
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
        });
      }

      // Create 5 upcoming events (within the next 10 days)
      for (let i = 0; i < 5; i++) {
        const date = new Date(now);
        date.setDate(now.getDate() + (i + 1)); // 1–5 days ahead
        const loc = locations[i % locations.length];

        mockEvents.push({
          title: `Upcoming Event ${i + 1}`,
          summary: `An exciting event happening soon in ${loc.suburb}!`,
          start: admin.firestore.Timestamp.fromDate(date),
          street: loc.street,
          suburb: loc.suburb,
          state: loc.state,
          lat: loc.lat,
          lng: loc.lng,
          image: "",
          attendance: Math.floor(Math.random() * 20), // 0–20
          interest: Math.floor(Math.random() * 80) + 10, // 10–90
          avgRating: 0,
          ratingCount: 0,
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
        });
      }

      // Upload all mock events
      const batch = db.batch();
      mockEvents.forEach((e) => {
        const ref = eventsRef.doc();
        batch.set(ref, e);
      });

      await batch.commit();

      res.status(200).send({
        success: true,
        count: mockEvents.length,
        message: "✅ Successfully populated 10 mock events!",
      });
    } catch (error) {
      console.error("🔥 Error populating mock events:", error);
      res.status(500).send({
        success: false,
        message: error.message,
      });
    }
  });
});

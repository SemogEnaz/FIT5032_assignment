const {setGlobalOptions} = require("firebase-functions");
const {onRequest} = require("firebase-functions/https");
const admin = require("firebase-admin");
const cors = require("cors")({origin: true});
setGlobalOptions({maxInstances: 10});
admin.initializeApp();

const { Resend } = require('resend');
const resend = new Resend('re_b1Bxz88i_EUv4KahveDrfqcETcr6ceXJW');

exports.createUser = onRequest((req, res) => {
  cors(req, res, async () => {
    try {
      // Ensure the request is a POST
      if (req.method !== 'POST') {
        return res.status(405).send('Method Not Allowed');
      }

      const { uid, firstName, lastName, email, address, phone, role } = req.body;

      console.log(req.body);

      // Validate required fields
      if (!uid || !email) {
        return res.status(400).send('Missing required fields: uid or email');
      }

      const userRef = admin.firestore().collection('users').doc(uid);

      await userRef.set({
        firstName: firstName || '',
        lastName: lastName || '',
        email,
        address: address || '',
        phone: phone || '',
        role: role || 'member',
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      res.status(200).send({ success: true, message: 'User added to Firestore successfully.' });
    } catch (error) {
      console.error('Error adding user:', error.message);
      res.status(500).send('Error adding user to Firestore');
    }
  });
});

exports.getUserProfile = onRequest((req, res) => {
  cors(req, res, async () => {
    try {
      // Only allow POST for security
      if (req.method !== 'POST') {
        return res.status(405).send('Method Not Allowed');
      }

      const { uid } = req.body;
      if (!uid) {
        return res.status(400).send('Missing user UID');
      }

      // Retrieve user document from Firestore
      const userRef = admin.firestore().collection('users').doc(uid);
      const snap = await userRef.get();

      if (!snap.exists) {
        return res.status(404).send('User not found');
      }

      const data = snap.data();

      // Optionally sanitize what you return (never send sensitive fields)
      delete data.password;

      res.status(200).send({ success: true, user: data });
    } catch (error) {
      console.error('Error fetching user profile:', error);
      res.status(500).send({ success: false, message: error.message });
    }
  });
});

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

// functions/index.js
exports.createBlog = onRequest((req, res) => {
  cors(req, res, async () => {
    try {
      const data = req.body;
      if (!data.title || !data.slug || !data.date) {
        return res.status(400).send({ success: false, message: 'Missing required fields' });
      }

      const blogRef = admin.firestore().collection('blogs').doc(data.slug);
      await blogRef.set({
        title: data.title,
        slug: data.slug,
        date: data.date,
        excerpt: data.excerpt || '',
        body: data.body || '',
        cover: data.cover || '',
        tags: data.tags || [],
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      res.status(200).send({ success: true, message: 'Blog created successfully', blog: data });
    } catch (error) {
      console.error('Error creating blog:', error);
      res.status(500).send({ success: false, message: error.message });
    }
  });
});

exports.getRecentBlogs = onRequest((req, res) => {
  cors(req, res, async () => {
    try {
      const blogsRef = await admin.firestore().collection('blogs');
      const snapshot = await blogsRef
          .orderBy('date', 'desc')
          .limit(3)
          .get();

      const blogs = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      res.status(200).send({ success: true, blogs });
    } catch (error) {
      console.error('Error fetching blogs:', error);
      res.status(500).send({ success: false, message: error.message });
    }
  });
});

exports.sendWelcomeEmail = onRequest((req, res) => {
  cors(req, res, async () => {
    try {
      if (req.method !== "POST") {
        return res.status(405).send({ success: false, message: "Method Not Allowed" });
      }

      const { email, firstName, lastName } = req.body;
      if (!email) {
        return res.status(400).send({ success: false, message: "Missing email" });
      }

      resend.emails.send({
        from: "onboarding@resend.dev",
        to: 'semogenaz@gmail.com',
        subject: "Welcome to Clayton Pool Association!",
        html: `<p>Hello ${firstName || ""} ${lastName || ""},</p><p>Thank you for registering with Clayton Pool Association.</p>`
      });

      res.status(200).send({ success: true, message: 'Email sent successfully' });
    } catch (error) {
      console.error("Error sending welcome email:", error);
      res.status(500).send({ success: false, message: "Error sending email: " + error.message });
    }
  });
});

const MAPBOX_TOKEN = "pk.eyJ1IjoiemFuZWdvbWVzIiwiYSI6ImNrdWdkbTAyaTBwbDIybm9reDc2YTN1cTUifQ.VjtSCzzUg7gg64u2HaAnBg";

exports.getLatLngFromAddress = onRequest((req, res) => {
  cors(req, res, async () => {
    try {
      if (req.method !== "POST") {
        return res.status(405).send("Method Not Allowed");
      }

      const { street, suburb, state, country } = req.body;
      if (!street || !suburb || !state || !country) {
        return res.status(400).send("Missing address components");
      }

      // Build address string
      const query = encodeURIComponent(`${street}, ${suburb}, ${state}, ${country}`);

      // Use your Mapbox access token (set it as an environment variable for security)

      const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${query}.json?access_token=${MAPBOX_TOKEN}`;

      const response = await fetch(url);
      const data = await response.json();

      if (!data.features || data.features.length === 0) {
        return res.status(404).send({ success: false, message: "No results found" });
      }

      const [lng, lat] = data.features[0].center;

      res.status(200).send({
        success: true,
        lat,
        lng,
        place_name: data.features[0].place_name,
      });
    } catch (error) {
      console.error("Error fetching coordinates:", error);
      res.status(500).send({ success: false, message: "Error fetching coordinates: " + error.message });
    }
  });
});

exports.getRecentAttendance = onRequest((req, res) => {
  cors(req, res, async () => {
    try {
      const db = admin.firestore();
      const eventsRef = db.collection("events");

      // Get date 15 days ago
      const now = new Date();
      const past = new Date();
      past.setDate(now.getDate() - 15);

      // Query Firestore for events starting within the last 15 days
      const snapshot = await eventsRef
          .where("start", ">=", admin.firestore.Timestamp.fromDate(past))
          .get();

      // ✅ Always return a consistent JSON response
      if (snapshot.empty) {
        console.log("⚠️ No events found in last 15 days");
        return res.status(200).json({ success: true, data: [] });
      }

      // Aggregate attendance + interest totals by day
      const totals = {};
      snapshot.forEach((doc) => {
        const e = doc.data();
        // ✅ Convert Firestore Timestamp -> JS Date
        const eventDate = e.start.toDate().toISOString().split("T")[0];

        if (!totals[eventDate]) {
          totals[eventDate] = { totalAttendance: 0, totalInterest: 0 };
        }

        totals[eventDate].totalAttendance += e.attendance || 0;
        totals[eventDate].totalInterest += e.interest || 0;
      });

      // Convert totals to sorted array
      const result = Object.entries(totals)
          .map(([date, { totalAttendance, totalInterest }]) => ({
            date,
            totalAttendance,
            totalInterest,
          }))
          .sort((a, b) => new Date(a.date) - new Date(b.date));

      console.log("✅ Returning result:", result);

      // ✅ Return JSON with consistent format
      return res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      console.error("🔥 Error fetching attendance:", error);
      return res.status(500).json({
        success: false,
        message: error.message,
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

const { onSchedule } = require("firebase-functions/v2/scheduler");

exports.sendEventReminders = onSchedule("every 1 hours", async (event) => {
  const db = admin.firestore();
  const now = new Date();
  const next24h = new Date(now.getTime() + 24 * 60 * 60 * 1000);

  const eventsSnap = await db
      .collection("events")
      .where("start", ">=", admin.firestore.Timestamp.fromDate(now))
      .where("start", "<=", admin.firestore.Timestamp.fromDate(next24h))
      .get();

  if (eventsSnap.empty) {
    console.log("No events starting in next 24 hours.");
    return;
  }

  for (const eventDoc of eventsSnap.docs) {
    const eventData = eventDoc.data();
    const registrationsSnap = await db
        .collection("events")
        .doc(eventDoc.id)
        .collection("registrations")
        .get();

    if (registrationsSnap.empty) continue;

    const emails = registrationsSnap.docs.map((doc) => doc.data().email);
    console.log(`📬 Sending reminders for "${eventData.title}" to`, emails);

    const { data, error } = await resend.batch.send([
      {
        from: 'onboarding@resend.dev',
        to: emails,
        subject: 'Upcoming Event Reminder',
        html: `You have registered to attend ${eventData.title} at ${eventData.start}`,
      },
    ]);
  }
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

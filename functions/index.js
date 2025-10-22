const {setGlobalOptions} = require("firebase-functions");
const {onRequest} = require("firebase-functions/https");
const admin = require("firebase-admin");
const cors = require("cors")({origin: true});
setGlobalOptions({maxInstances: 10});
admin.initializeApp();

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
        lat, lng
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
        start,
        street, suburb, state,
        image: image || "",
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        lat: lat, lng: lng
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

      const events = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

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

// Import SendGrid mail library
const sgMail = require("@sendgrid/mail");
// Set your SendGrid API key (store it securely e.g. in Functions config)
sgMail.setApiKey('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');

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

      // Compose message
      const msg = {
        to: email,
        from: "zgom0003@student.monash.edu", // Must be verified in your SendGrid account
        subject: "Welcome to Clayton Pool Association!",
        text: `Hello ${firstName || ""} ${lastName || ""},\n\nThank you for registering with Clayton Pool Association.`,
        html: `<p>Hello ${firstName || ""} ${lastName || ""},</p><p>Thank you for registering with Clayton Pool Association.</p>`,
      };

      const emailRes = await sgMail.send(msg);

      res.status(200).send({ success: true, message: emailRes[0].headers, status: emailRes[0].statusCode });
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

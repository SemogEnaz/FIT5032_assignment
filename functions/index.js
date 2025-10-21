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

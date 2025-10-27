const { onRequest } = require("firebase-functions/v2/https");
const admin = require("firebase-admin");
const cors = require("cors")({ origin: true });

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
      if (req.method !== 'POST') {
        return res.status(405).send('Method Not Allowed');
      }

      const { uid } = req.body;
      if (!uid) {
        return res.status(400).send('Missing user UID');
      }

      const userRef = admin.firestore().collection('users').doc(uid);
      const snap = await userRef.get();

      if (!snap.exists) {
        return res.status(404).send('User not found');
      }

      const data = snap.data();

      // Ensure uid is always attached
      data.uid = uid;

      delete data.password; // optional sanitization

      return res.status(200).send({
        success: true,
        user: data,
      });
    } catch (error) {
      console.error('Error fetching user profile:', error);
      return res.status(500).send({
        success: false,
        message: error.message,
      });
    }
  });
});

exports.verifySessionUser = onRequest((req, res) => {
  cors(req, res, async () => {
    try {
      if (req.method !== "POST") {
        return res.status(405).send({ success: false, message: "Method Not Allowed" });
      }

      const { uid } = req.body;
      if (!uid) {
        return res.status(400).send({ success: false, message: "Missing uid" });
      }

      const userRef = admin.firestore().collection("users").doc(uid);
      const snap = await userRef.get();

      if (!snap.exists) {
        return res.status(404).send({ success: false, message: "User not found" });
      }

      const data = snap.data();
      return res.status(200).send({
        success: true,
        role: data.role,
        user: {
          firstName: data.firstName,
          lastName: data.lastName,
          email: data.email,
          role: data.role,
        },
      });
    } catch (error) {
      console.error("  Error verifying session:", error);
      return res.status(500).send({ success: false, message: error.message });
    }
  });
});

exports.deleteUser = onRequest((req, res) => {
  cors(req, res, async () => {
    try {
      if (req.method !== "POST") {
        return res.status(405).send("Method Not Allowed");
      }

      const { uid } = req.body;
      if (!uid) {
        return res.status(400).json({ success: false, message: "Missing UID" });
      }

      const db = admin.firestore();

      // Delete from Auth
      await admin.auth().deleteUser(uid);

      // Delete from Firestore (assuming collection is 'users')
      await db.collection("users").doc(uid).delete();

      res.status(200).json({ success: true, message: `User ${uid} deleted.` });
    } catch (err) {
      console.error("  Error deleting user:", err);
      res.status(500).json({ success: false, message: err.message });
    }
  });
});

exports.getAllUsers = onRequest((req, res) => {
  cors(req, res, async () => {
    try {
      const db = admin.firestore();
      const snapshot = await db.collection("users").get();

      const users = snapshot.docs.map((doc) => ({
        uid: doc.id,
        ...doc.data(),
      }));

      res.status(200).json({
        success: true,
        count: users.length,
        users,
      });
    } catch (err) {
      console.error("  Error fetching users:", err);
      res.status(500).json({ success: false, message: err.message });
    }
  });
});

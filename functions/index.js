/**
 * Import function triggers from their respective submodules:
 *
 * const {onCall} = require("firebase-functions/v2/https");
 * const {onDocumentWritten} = require("firebase-functions/v2/firestore");
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

const {setGlobalOptions} = require("firebase-functions");
const {onRequest} = require("firebase-functions/https");
const { onDocumentCreated } = require('firebase-functions/v2/firestore');

const admin = require("firebase-admin");
const cors = require("cors")({origin: true});
// const logger = require("firebase-functions/logger");

// For cost control, you can set the maximum number of containers that can be
// running at the same time. This helps mitigate the impact of unexpected
// traffic spikes by instead downgrading performance. This limit is a
// per-function limit. You can override the limit for each function using the
// `maxInstances` option in the function's options, e.g.
// `onRequest({ maxInstances: 5 }, (req, res) => { ... })`.
// NOTE: setGlobalOptions does not apply to functions using the v1 API. V1
// functions should each use functions.runWith({ maxInstances: 10 }) instead.
// In the v1 API, each function can only serve one request per container, so
// this will be the maximum concurrent request count.
setGlobalOptions({ region: 'australia-southeast2', maxInstances: 10});

// Create and deploy your first functions
// https://firebase.google.com/docs/functions/get-started

// exports.helloWorld = onRequest((request, response) => {
//   logger.info("Hello logs!", {structuredData: true});
//   response.send("Hello from Firebase!");
// });

admin.initializeApp();

// ---------- helpers ----------
/** Uppercase all string fields (shallow) */
function uppercaseStringsShallow(obj) {
  const out = {};
  for (const [k, v] of Object.entries(obj || {})) {
    if (typeof v === 'string') out[k] = v.toUpperCase();
    else out[k] = v;
  }
  return out;
}

// ---------- 1) HTTP: createBook (client sends raw, server writes; trigger will normalize) ----------
exports.createBook = onRequest(async (req, res) => {
  // Allow GET for quick testing (but prefer POST)
  if (req.method === 'OPTIONS') {
    res.set('Access-Control-Allow-Origin', '*');
    res.set('Access-Control-Allow-Methods', 'POST,GET,OPTIONS');
    res.set('Access-Control-Allow-Headers', 'Content-Type');
    return res.status(204).send('');
  }

  return cors(req, res, async () => {
    try {
      const isPost = req.method === 'POST';
      const payload = isPost ? (req.body || {}) : (req.query || {});
      const { name, author, isbn } = payload;

      if (!name || !author || !isbn) {
        return res.status(400).json({
          error: "Missing required fields: 'name', 'author', 'isbn'.",
          example: { name: 'the hobbit', author: 'j.r.r. tolkien', isbn: '9780261103344' }
        });
      }

      const data = {
        name: String(name),
        author: String(author),
        isbn: String(isbn),        // keep as string to avoid int precision issues
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        normalized: false          // marker to show trigger hasn’t run yet
      };

      const ref = await admin.firestore().collection('books').add(data);

      // Return the new id and the raw data you sent (pre-normalization)
      return res.status(201).json({
        id: ref.id,
        note: 'Book created. A Firestore trigger will capitalize string fields shortly.',
        beforeNormalization: data
      });
    } catch (err) {
      console.error('createBook error:', err);
      return res.status(500).json({ error: 'Internal error creating book.' });
    }
  });
});

// ---------- 2) Firestore trigger: capitalize on create ----------
exports.capitalizeBookOnCreate = onDocumentCreated('books/{bookId}', async (event) => {
  const snap = event.data;
  if (!snap) return;

  const docRef = snap.ref;
  const data = snap.data();

  // Avoid loops: if already normalized, skip
  if (data.normalized) return;

  const upper = uppercaseStringsShallow(data);
  upper.normalized = true;                        // mark normalized
  upper.normalizedAt = admin.firestore.FieldValue.serverTimestamp();

  try {
    await docRef.update(upper);
  } catch (err) {
    console.error('capitalizeBookOnCreate update error:', err);
  }
});

// ---------- 3) HTTP: getBook (fetch the current, capitalized doc to display outcome) ----------
exports.getBook = onRequest(async (req, res) => {
  if (req.method === 'OPTIONS') {
    res.set('Access-Control-Allow-Origin', '*');
    res.set('Access-Control-Allow-Methods', 'GET,OPTIONS');
    res.set('Access-Control-Allow-Headers', 'Content-Type');
    return res.status(204).send('');
  }

  return cors(req, res, async () => {
    try {
      const id = (req.query && req.query.id) || (req.body && req.body.id);
      if (!id) return res.status(400).json({ error: "Missing 'id' query param." });

      const doc = await admin.firestore().collection('books').doc(id).get();
      if (!doc.exists) return res.status(404).json({ error: 'Book not found.' });

      return res.status(200).json({ id: doc.id, data: doc.data() });
    } catch (err) {
      console.error('getBook error:', err);
      return res.status(500).json({ error: 'Internal error fetching book.' });
    }
  });
});

exports.countBooks = onRequest((req, res) => {
  cors(req, res, async () => {
    try {
      const booksCollection = admin.firestore().collection("books");
      const snapshot = await booksCollection.get();
      const count = snapshot.size;

      res.status(200).send({count});
    } catch (error) {
      console.error("Error counting books:", error.message);
      res.status(500).send("Error counting books");
    }
  });
});

const { onRequest } = require("firebase-functions/v2/https");
const cors = require("cors")({ origin: true });
const admin = require("firebase-admin");
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

exports.getMapData = onRequest((req, res) => {
  cors(req, res, async () => {
    try {
      const db = admin.firestore();
      const now = new Date();

      // Get the 10 next upcoming events
      const snapshot = await db
          .collection("events")
          .where("start", ">=", admin.firestore.Timestamp.fromDate(now))
          .orderBy("start", "asc")
          .limit(10)
          .get();

      if (snapshot.empty) {
        return res.status(200).json({
          success: true,
          message: "No upcoming events found",
          map: { center: [144.9631, -37.8136], zoom: 10, markers: [] },
        });
      }

      // Convert events to marker data
      const events = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      // Get markers for all events that have coordinates
      const markers = events
          .filter((e) => typeof e.lng === "number" && typeof e.lat === "number")
          .map((e) => ({
            id: e.id,
            title: e.title,
            coordinates: [e.lng, e.lat],
            popup: `${e.title}<br>${e.street}, ${e.suburb}`,
          }));

      // If no coordinates available, fallback to Melbourne
      const hasCoords = markers.length > 0;
      const center = hasCoords ? [
        markers.reduce((sum, m) => sum + m.coordinates[0], 0) / markers.length,
        markers.reduce((sum, m) => sum + m.coordinates[1], 0) / markers.length,
      ] : [144.9631, -37.8136];

      // Optional: fetch map style directly from Mapbox to confirm the token works
      const styleURL = `https://api.mapbox.com/styles/v1/mapbox/standard?access_token=${MAPBOX_TOKEN}`;
      const styleRes = await fetch(styleURL);
      const styleData = await styleRes.json();

      res.status(200).json({
        success: true,
        map: {
          token: MAPBOX_TOKEN, // ✅ Return token for JS map initialization (if needed)
          style: styleData,
          center,
          zoom: 10,
          markers,
        },
      });
    } catch (error) {
      console.error("🔥 Error building map data:", error);
      res.status(500).json({
        success: false,
        message: "Error fetching map data: " + error.message,
      });
    }
  });
});

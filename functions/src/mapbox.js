const { onRequest } = require("firebase-functions/v2/https");
const cors = require("cors")({ origin: true });
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

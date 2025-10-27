const { onRequest } = require("firebase-functions/v2/https");
const admin = require("firebase-admin");
const cors = require("cors")({ origin: true });

exports.getChartData = onRequest((req, res) => {
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

      //   Always return a consistent JSON response
      if (snapshot.empty) {
        console.log("⚠️ No events found in last 15 days");
        return res.status(200).json({ success: true, data: [] });
      }

      // Aggregate attendance + interest totals by day
      const totals = {};
      snapshot.forEach((doc) => {
        const e = doc.data();
        //   Convert Firestore Timestamp -> JS Date
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

      console.log("  Returning result:", result);

      //   Return JSON with consistent format
      return res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      console.error(" Error fetching attendance:", error);
      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  });
});

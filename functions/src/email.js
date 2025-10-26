const { onRequest } = require("firebase-functions/v2/https");
const cors = require("cors")({ origin: true });
const { Resend } = require('resend');
const resend = new Resend('re_b1Bxz88i_EUv4KahveDrfqcETcr6ceXJW');
const { onSchedule } = require("firebase-functions/v2/scheduler");

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

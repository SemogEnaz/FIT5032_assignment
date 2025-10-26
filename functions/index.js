const {setGlobalOptions} = require("firebase-functions");
setGlobalOptions({maxInstances: 10});

const admin = require("firebase-admin");
admin.initializeApp();

// User functions
const {
  createUser,
  getUserProfile,
} = require('./src/user');

// Event operations
const {
  createEvent,
  getRecentEvents,
  registerForEvent,
  rateEvent,
  getEventRating,
  deleteEvent,
  registerOrAttendEvent,
  getEventRegistrationStatus,
  populateMockEvents,
} = require('./src/event');

const {
  getChartData,
} = require('./src/chart');

const {
  getLatLngFromAddress,
} = require('./src/mapbox');

const {
  sendWelcomeEmail,
  sendEventReminders,
} = require('./src/email');

// Users
exports.createUser = createUser;
exports.getUserProfile = getUserProfile;

// Events
exports.creatEvent = createEvent;
exports.getRecentEvents = getRecentEvents;
exports.registerForEvent = registerForEvent;
exports.rateEvent = rateEvent;
exports.getEventRating = getEventRating;
exports.deleteEvent = deleteEvent;
exports.registerOrAttendEvent = registerOrAttendEvent;
exports.getEventRegistrationStatus = getEventRegistrationStatus;
exports.populateMockEvents = populateMockEvents;

// Chart
exports.getChartData = getChartData;

// Mapbox
exports.getLatLngFromAddress = getLatLngFromAddress;

// Email
exports.sendWelcomeEmail = sendWelcomeEmail;
exports.sendEventReminders = sendEventReminders;

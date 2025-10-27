const {setGlobalOptions} = require("firebase-functions");
setGlobalOptions({maxInstances: 10});

const admin = require("firebase-admin");
admin.initializeApp();

// User functions
const {
  createUser,
  getUserProfile,
  verifySessionUser,
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
  getUpcomingEvents,
  getPastEvents,
} = require('./src/event');

const {
  getChartData,
} = require('./src/chart');

const {
  getLatLngFromAddress,
  getMapData,
} = require('./src/mapbox');

const {
  sendWelcomeEmail,
  sendEventReminders,
} = require('./src/email');

// Users
exports.createUser = createUser;
exports.getUserProfile = getUserProfile;
exports.verifySessionUser = verifySessionUser;

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
exports.getUpcomingEvents = getUpcomingEvents;
exports.getPastEvents = getPastEvents;

// Chart
exports.getChartData = getChartData;

// Mapbox
exports.getLatLngFromAddress = getLatLngFromAddress;
exports.getMapData = getMapData;

// Email
exports.sendWelcomeEmail = sendWelcomeEmail;
exports.sendEventReminders = sendEventReminders;

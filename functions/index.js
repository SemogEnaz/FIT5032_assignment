const {setGlobalOptions} = require("firebase-functions");
setGlobalOptions({maxInstances: 10});

const admin = require("firebase-admin");
admin.initializeApp();

// User functions
const {
  createUser,
  getUserProfile,
  verifySessionUser,
  deleteUser,
  getAllUsers,
} = require('./src/user');

// Event operations
const {
  createEvent,
  rateEvent,
  getEventRating,
  deleteEvent,
  registerOrAttendEvent,
  getEventRegistrationStatus,
  populateMockEvents,
  getUpcomingEvents,
  getPastEvents,
  getAllEvents,
} = require('./src/event');

const {
  getChartData,
} = require('./src/chart');

const {
  getLatLngFromAddress,
  getMapData,
  getDrivingDistance,
  getNearbyEvents,
} = require('./src/mapbox');

const {
  sendWelcomeEmail,
  sendEventReminders,
} = require('./src/email');

// Users
exports.createUser = createUser;
exports.getUserProfile = getUserProfile;
exports.verifySessionUser = verifySessionUser;
exports.deleteUser = deleteUser;
exports.getAllUsers = getAllUsers;

// Events
exports.creatEvent = createEvent;
exports.rateEvent = rateEvent;
exports.getEventRating = getEventRating;
exports.deleteEvent = deleteEvent;
exports.registerOrAttendEvent = registerOrAttendEvent;
exports.getEventRegistrationStatus = getEventRegistrationStatus;
exports.populateMockEvents = populateMockEvents;
exports.getUpcomingEvents = getUpcomingEvents;
exports.getPastEvents = getPastEvents;
exports.getAllEvents = getAllEvents;

// Chart
exports.getChartData = getChartData;

// Mapbox
exports.getLatLngFromAddress = getLatLngFromAddress;
exports.getMapData = getMapData;
exports.getDrivingDistance = getDrivingDistance;
exports.getNearbyEvents = getNearbyEvents;

// Email
exports.sendWelcomeEmail = sendWelcomeEmail;
exports.sendEventReminders = sendEventReminders;

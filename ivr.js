var sapp    = require('./sapp'),
ivr_factory = require('./ivr-factory');
// EFFECTS:
// 1. Looks up ivr settings based on number from request
// 2. Creates a new ivr session
// 3. Starts the session
// 4. returns a promise resolving with the ivr session
var newSession = function(req) {
  return sapp.ivr_settings(req.query.To).then(function(settings) {
    var ivr = ivr_factory.create(settings);
    return ivr.run();
  });
};

// EFFECTS:
// 1. Initializes an existing ivr session from a request object's session data
// 2. Executes instructions for the current node
// 3. Updates the current node
var resumeSession = function(req) {
  return ivr_factory.create(req.session.ivr).run();
};

var gather = function(req) {
  return ivr_factory.create(req.session.ivr).gather();
};

var split = function(req) {
  return ivr_factory.create(req.session.ivr).split();
};

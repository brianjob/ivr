var sapp    = require('./sapp'),
ivr_factory = require('./ivr-factory');
// EFFECTS:
// 1. Looks up ivr settings based on number from request
// 2. Creates a new ivr session
// 3. Starts the session
// 4. returns a promise resolving with the ivr session
module.exports.newSession = function(req) {
  console.log('ivr.newSession()');
  return sapp.ivr_settings(req.query.To).then(function(settings) {
    console.log('SETTINGS: ' + JSON.stringify(settings, undefined, 2));
    var ivr = ivr_factory.create(settings);
    req.session.ivr = ivr;
    return ivr.run();
  });
};

// EFFECTS:
// 1. Initializes an existing ivr session from a request object's session data
// 2. Executes instructions for the current node
// 3. Updates the current node
module.exports.resumeSession = function(req) {
  return ivr_factory.create(req.session.ivr).run();
};

module.exports.gather = function(req) {
  return ivr_factory.create(req.session.ivr).gather();
};

module.exports.split = function(req) {
  return ivr_factory.create(req.session.ivr).split();
};

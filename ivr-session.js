// ivr-session.js
// Author:      Brian Barton
// Description: This module binds ivr objects to session objects

var sapp    = require('./sapp'),
ivr_factory = require('./ivr-factory');

// EFFECTS:
// 1. Looks up ivr settings based on number from request
// 2. Creates a new ivr session
// 3. Starts the session
// 4. returns a promise resolving with the ivr session
module.exports.newSession = function(req) {
  return sapp.ivr_settings(req.query.To).then(function(settings) {
    var ivr = ivr_factory.create(settings);
    var result = ivr.run();
    req.session.ivr = ivr.toJSON();
    return result;
  });
};

// EFFECTS:
// 1. constructs a new ivr object from a session
// 2. runs any preprocess method on the ivr (split, gather, etc.) if applicable
// 3. runs the next node
// 4. updates the session state
// 5. returns the twiml
var resumeSessionHelper = function(req, preprocess) {
  console.log('BODY: ' + JSON.stringify(req.body));
  var ivr = ivr_factory.create(JSON.parse(req.session.ivr));
  if (preprocess) {
    ivr.current_node[preprocess](req.body.Digits);
  }
  var response = ivr.run();
  req.session.ivr = ivr.toJSON();
  return response;
};

// EFFECTS:
// 1. Initializes an existing ivr session from a request object's session data
// 2. Executes instructions for the current node
// 3. Updates the current node
module.exports.resumeSession = function(req) {
  return resumeSessionHelper(req);
};

module.exports.gather = function(req) {
  return resumeSessionHelper(req, 'gather');
};

module.exports.split = function(req) {
  return resumeSessionHelper(req, 'split');
};


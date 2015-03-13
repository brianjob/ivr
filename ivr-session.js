// ivr-session.js
// Author:      Brian Barton
// Description: This module binds ivr objects to session objects
var sapp    = require('./sapp'),
ivr_factory = require('./ivr-factory');

// EFFECTS:
// 1. Looks up ivr settings based on phone number from request
// 2. Creates a new ivr session
// 3. Starts the session
// RETURNS a promise resolving with the ivr session
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
// 2. runs the next node
// 3. updates the session state
// RETURNS a promise resolving with the twiml
module.exports.resumeSession = function(req) {
  var ivr = ivr_factory.create(JSON.parse(req.session.ivr));
  
  console.log('RESUME SESSION PRE');
  console.dir(ivr);

  return ivr.run(req.body.Digits).then(function(result) {
    req.session.ivr = ivr.toJSON();
    console.log('RESUME SESSION RETURN');
    return result;
  });
};



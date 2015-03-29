// ivr-session.js
// Author:      Brian Barton
// Description: This module binds ivr objects to session objects
var Q       = require('q');
var sapp    = require('./sapp'),
ivr_tracker = require('./ivr-tracker'),
ivr_factory = require('./ivr-factory');

// EFFECTS:
// 1. Looks up ivr settings based on phone number from request
// 2. Creates a new ivr session
// 3. Creates a new ivr tracker
// 4. Starts the session
// RETURNS a promise resolving with the ivr session
module.exports.newSession = function(req) {
  console.log('@@@ New IVR Session @@@');
  return sapp.ivr_settings(req.query.To).then(function(settings) {
    var ivr = ivr_factory.create(settings);
    var result = ivr.run();
    return ivr_tracker.create(req.query, ivr).then(function() {
      req.session.ivr = ivr.toJSON();
      return result;
    });
  });
};

// EFFECTS:
// 1. constructs a new ivr object from a session
// 2. runs the next node
// 3. updates the session state
// 4. updates the tracker
// RETURNS a promise resolving with the twiml
module.exports.resumeSession = function(req) {
  console.log('@@@ Resume IVR Session @@@');
  var ivr = ivr_factory.create(JSON.parse(req.session.ivr));
  console.log('@@@ ivr created, run node');
  return ivr.run(req.body).then(function(result) {
    console.log('@@@ run node complete, updating tracker');
    return ivr_tracker.update(ivr).then(function() {
      console.log('@@@ update tracker complete, storing session');
      req.session.ivr = ivr.toJSON();
      console.log('done');
      return result;
    });
  });
};


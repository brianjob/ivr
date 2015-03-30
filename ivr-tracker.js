var sapp = require('./sapp');
var extend = require('underscore').extend;

var getStandardParams = function(query) {
  return {
    call_sid       : query.CallSid,
    account_sid    : query.AccountSid,
    call_status    : query.CallStatus,
    api_version    : query.ApiVersion,
    direction      : query.Direction,
    forwarded_from : query.ForwardedFrom,
    caller_name    : query.CallerName,
    from           : query.From,
    from_city      : query.FromCity,
    from_state     : query.FromState,
    from_zip       : query.FromZip,
    from_country   : query.FromCountry,
    to             : query.To,
    to_city        : query.ToCity,
    to_state       : query.ToState,
    to_zip         : query.ToZip,
    to_country     : query.ToCountry
  };
};

module.exports.create = function(query, ivr) {
  return sapp.newIVRSession(getStandardParams(query), ivr);
};

module.exports.update = function(query, ivr) {
  return sapp.updateIVRSession(getStandardParams(query), ivr);
};

// called with a request from a call end callback (status callback) request
module.exports.end = function(query) {
  return sapp.updateIVRSession(extend(getStandardParams(query), {
    call_duration      : query.CallDuration,
    recording_url      : query.RecordingUrl,
    recording_sid      : query.RecordingSid,
    recording_duration : query.RecordingDuration
  }));
};

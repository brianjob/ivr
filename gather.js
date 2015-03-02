var twilio = require('twilio');

module.exports.run = function() {
  if (!this.prompt) { throw new Error('gather node must have a prompt'); }
  var twiml = new twilio.TwimlResponse();  
  
  twiml.gather({
    action      : '/gather',
    timeout     : this.timeout || this.ivr.default_timeout,
    numDigits   : this.numDigits,
    finsihOnKey : this.finishOnKey
  }, function() {
    this.say({
      voice    : this.voice    || this.ivr.default_voice,
      language : this.language || this.ivr.default_language
    }, this.prompt);
  });

  return twiml.toString();
};

module.exports.gather = function() {

};

var twilio = require('twilio');
var lib    = require('./library');

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

module.exports.gather = function(input) {
  lib[this.action](this.ivr.model, input);
  this.ivr.current_node = this.ivr.getNode(this.redirect);
};

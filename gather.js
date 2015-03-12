var lib  = require('./library');

module.exports.run = function() {
  console.log('GATHER.RUN(): ' + this.id);
  if (!this.prompt) { throw new Error('gather node must have a prompt'); }
  if (!this.redirect) { throw new Error('gather node must have redirect'); }
  if (!this.numDigits && !this.finishOnKey) { throw new Error('gather node must have either numDigits or finishOnKey'); }

  var self = this;
  this.ivr.twiml.gather({
    action      : '/gather',
    timeout     : this.timeout || this.ivr.default_timeout,
    numDigits   : this.numDigits,
    finsihOnKey : this.finishOnKey
  }, function() {
    this.say({
      voice    : self.voice    || self.ivr.default_voice,
      language : self.language || self.ivr.default_language
    }, self.prompt);
  });

  return this.ivr.twiml.toString();
};

module.exports.gather = function(input) {
  if (!lib[this.action]) { throw new Error('no action: ' + this.action + ' defined in libary.js'); }

  var result = lib[this.action](this.ivr.model, input);
  this.ivr.current_node = this.ivr.getNode(this.redirect);
  return result;
};

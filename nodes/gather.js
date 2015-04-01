var Q    = require('q');
var lib  = require('../library');

module.exports.run = function() {
  console.log('GATHER.RUN(): ' + this.id);
  if (!this.prompt) { throw new Error('gather node must have a prompt'); }
  if (!this.redirect) { throw new Error('gather node must have redirect'); }
  if (!this.numDigits && !this.finishOnKey) { throw new Error('gather node must have either numDigits or finishOnKey'); }

  var gather_opts = { 
    action      : '/',
    finishOnKey : this.finishOnKey || ''
  };

  if (this.timeout || this.ivr.default_timeout) { gather_opts.timeout = this.timeout || this.ivr.default_timeout; }
  if (this.numDigits) { gather_opts.numDigits = this.numDigits; }

  var self = this;
  var say_opts = {};
  if (self.voice || self.ivr.default_voice) { say_opts.voice = self.voice || self.ivr.default_voice; }
  if (self.language || self.ivr.default_language) { say_opts.language = self.language || self.ivr.default_language; }
  this.ivr.twiml.gather(gather_opts, function() { this.say(say_opts, self.prompt); });

  this.ivr.twiml.redirect({
    method : 'POST'
  }, '/');

  this.ivr.input_pending = true;

  return this.ivr.twiml.toString();
};

module.exports.resume = function(input) {
  if (!lib[this.action]) { throw new Error('no action: ' + this.action + ' defined in libary.js'); }

  var result = lib[this.action](this.ivr.model, input.Digits);

  if (Q.isPromise(result)) { // if async we need to wait until finished to update current node
    var self = this;
    return result.then(function() {
      self.ivr.current_node = self.ivr.getNode(self.redirect);
    });
  }
  this.ivr.current_node = this.ivr.getNode(this.redirect);
  return result;
};

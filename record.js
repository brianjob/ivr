var lib = require('./library');
var sapp = require('./sapp');

module.exports.run = function() {
  if (!this.redirect) { throw new Error('record node: ' + this.id + ' must have redirect'); }

  this.ivr.twiml.record({
    action      : '/',
    timeout     : this.timeout || this.ivr.default_timeout,
    finishOnKey : this.finishOnKey,
    maxLength   : this.maxLength,
    playBeep    : this.playBeep
  });

  this.ivr.input_pending = true;

  return this.ivr.twiml.toString();
};

module.exports.resume = function() {
  throw new Error('NOT IMPLEMENTED');
};

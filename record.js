var lib = require('./library');

module.exports.run = function() {
  if (!this.redirect) { throw new Error('record node: ' + this.id + ' must have redirect'); }

  this.ivr.twiml.record({
    action      : '/',
    timeout     : this.timeout || this.ivr.default_timeout,
    finishOnKey : this.finishOnKey,
    maxLength   : this.maxLength,
    playBeep    : this.playBeep,
    trim        : 'trim-silence'
  });

  this.input_pending = true;

  return this.ivr.twiml.toString();
};

module.exports.resume = function(input) {
  if (!lib[this.action]) { throw new Error('no action: ' + this.action + ' defined in library.js'); }

  var recording = input.RecordingUrl;

  console.log('Recording URL: ' + recording);
};

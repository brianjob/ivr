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

module.exports.resume = function(input) {
  console.log('RECORD RESUME');

  return sapp.transcriptionText(input.RecordingUrl).then(function(text) { 
    console.log(text);   
    this.ivr.current_node = this.ivr.getNode(this.redirect); 
    return text;
  });
};

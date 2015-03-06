module.exports.run = function() {
  this.ivr.twiml.hangup();
  return this.ivr.twiml.toString();
};

module.exports.run = function() {
  if (!this.redirect) { throw new Error('dial node: ' + this.id + ' must have redirect'); }
  this.ivr.twiml.dial({
    action       : '/',
    method       : 'POST',
    timeout      : this.timeout || this.ivr.default_timeout,
    record       : this.record,
    hangupOnStar : this.hangUpOnStar
  });

  this.ivr.current_node = this.ivr.getNode(this.redirect);

  return this.ivr.twiml.toString();
};

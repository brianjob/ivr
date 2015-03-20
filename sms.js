var bars = require('handlebars');

module.exports.run = function() {
  if (!this.template) { throw new Error('sms node: ' + this.id + ' must have template'); }
  if (!this.redirect) { throw new Error('sms node: ' + this.id + ' must have redirect'); }

  var template = bars.compile(this.template);

  this.ivr.twiml.sms({
    to             : this.to,
    from           : this.from,
    action         : '/',
    method         : 'POST',
    statusCallback : '/sms'
  }, template(this.ivr.model));

  this.ivr.current_node = this.ivr.getNode(this.redirect);
};

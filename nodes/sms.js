var bars = require('handlebars');

module.exports.run = function() {
  console.log('SMS.RUN(): ' + this.id);
  if (!this.template) { throw new Error('sms node: ' + this.id + ' must have template'); }
  if (!this.redirect) { throw new Error('sms node: ' + this.id + ' must have redirect'); }

  var template = bars.compile(this.template);

  this.ivr.twiml.sms({
    action : '/',
    method : 'POST',
  }, template(this.ivr.model));

  this.ivr.current_node = this.ivr.getNode(this.redirect);

  return this.ivr.twiml.toString();
};

var twilio = require('twilio');
var bars   = require('handlebars');

module.exports.run = function(model) {
  if (!this.template) { 
    for (var prop in this) { console.log(prop); }
    throw new Error('say node must have template'); 
  }
  var template = bars.compile(this.template);
  
  var twiml = new twilio.TwimlResponse();  
  twiml.say({
    voice    : this.voice    || this.ivr.default_voice,
    language : this.language || this.ivr.default_language,
  }, template(model));
  
  this.ivr.current_node = this.ivr.getNode(this.redirect);
  
  return twiml.toString() + this.ivr.current_node.run(); // recursion kewl
};

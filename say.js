var bars = require('handlebars');

module.exports.run = function(model) {
  console.log('SAY.RUN(): ' + this.id);
  if (!this.template) { throw new Error('say node must have template'); }
  if (!this.redirect) { throw new Error('say node must have redirect'); }

  var template = bars.compile(this.template);

  this.ivr.twiml.say({
    voice    : this.voice    || this.ivr.default_voice,
    language : this.language || this.ivr.default_language,
  }, template(model));
  
  this.ivr.current_node = this.ivr.getNode(this.redirect);
  
  var twim = this.ivr.current_node.run(); // we can't end on a say so just call the next node's run
  return twim;
};

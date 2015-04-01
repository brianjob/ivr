var bars = require('handlebars');

module.exports.run = function() {
  console.log('SAY.RUN(): ' + this.id);
  if (!this.template) { throw new Error('say node must have template'); }
  if (!this.redirect) { throw new Error('say node must have redirect'); }

  var template = bars.compile(this.template);

  var opts = {};
  if (this.voice || this.ivr.default_voice) { opts.voice = this.voice || this.ivr.default_voice; }
  if (this.language || this.ivr.default_langague) { opts.language = this.language || this.ivr.default_langague; }

  this.ivr.twiml.say(opts, template(this.ivr.model));
  
  this.ivr.current_node = this.ivr.getNode(this.redirect);
  
  return this.ivr.current_node.run(); // we can't end on a say so just call the next node's run
};

var lib = require('./library');

module.exports.run = function() {
  if (!this.action) { throw new Error('action node: ' + this.id +  ' must have an action'); }
  if (!this.redirect) { throw new Error('action node: ' + this.id + ' must have redirect'); }

  lib[this.action](this.ivr.model);

  this.ivr.current_node = this.ivr.getNode(this.redirect);
};

var Q   = require('q');
var lib = require('./library');

module.exports.run = function() {
  if (!this.action) { throw new Error('action node: ' + this.id +  ' must have an action'); }
  if (!this.redirect) { throw new Error('action node: ' + this.id + ' must have redirect'); }

  if (!lib[this.action]) {
    throw new Error(this.action + '() is not defined in library.js');
  }

  var result = lib[this.action](this.ivr.model);

  if (Q.isPromise(result)) {
    return result.then(function() {
      this.ivr.current_node = this.ivr.getNode(this.redirect);
      return this.ivr.current_node.run();
    });
  }

  this.ivr.current_node = this.ivr.getNode(this.redirect);

  return this.ivr.current_node.run();
};

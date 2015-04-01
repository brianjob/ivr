var Q   = require('q');
var lib = require('../library');

module.exports.run = function() {
  if (!this.action) { throw new Error('action node: ' + this.id +  ' must have an action'); }
  if (!this.redirect) { throw new Error('action node: ' + this.id + ' must have redirect'); }

  if (!lib[this.action]) {
    throw new Error(this.action + '() is not defined in library.js');
  }

  var result = lib[this.action](this.ivr.model, this.action_arg);

  if (Q.isPromise(result)) {
    console.log('RESULT of ' + this.action + ' is a PROMISE');
    var self = this;
    return result.then(function() {
      self.ivr.current_node = self.ivr.getNode(self.redirect);
      return self.ivr.current_node.run();
    });
  }

  console.log('RESULT of ' + this.action + ' is NOT a promise');
  this.ivr.current_node = this.ivr.getNode(this.redirect);
  return this.ivr.current_node.run();
};

var Q   = require('q');
var lib = require('../library');

module.exports.run = function() {
  if (! (this.paths && this.paths.length > 0) ) {
    throw new Error('split condition node: ' + this.id + ' must have at least one path');
  }
  if (!this.default_redirect) { throw new Error('split condition node must define default_redirect'); }

  var self = this;
  var result = this.paths.filter(function(elt) {
    if (!elt.redirect) { throw new Error('path must define redirect'); }
    if (!elt.condition) { throw new Error('path must define condition'); }
    if (!lib[elt.condition]) { throw new Error('library contains no function: ' + elt.condition); }

    var satisfies_condition = lib[elt.condition](self.ivr.model);
    if (Q.isPromise(satisfies_condition)) {
      throw new Error('condition functions can not return promises');
    }
    return satisfies_condition;
  })[0];

  this.ivr.current_node = this.ivr.getNode((result && result.redirect) || this.default_redirect);

  return this.ivr.current_node.run();
};

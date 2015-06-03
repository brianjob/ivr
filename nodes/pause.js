module.exports.run = function() {
  if (!this.redirect) { throw new Error('pause node ' + this.id + ' must have redirect'); }

  var opts = {};
  if (this.length) { opts.length = this.length; }

  this.ivr.twiml.pause(opts);
  
  this.ivr.current_node = this.ivr.getNode(this.redirect);
  
  return this.ivr.current_node.run(); // we can't end on a pause so just call the next node's run
};

// ivr-factory.js
// Author:      Brian Barton
// Description: Factory that takes a JSON specification and returns an IVR object

var Q = require('q'),
    _ = require('underscore');

// takes a thing as input. if that thing is a promise it returns it, 
// otherwise it creates a promise resolving to thing and returns it
var promisefy = function(thing) {
  if (Q.isPromise(thing)) {
    return thing;
  }
  return Q.fcall(function() { return thing; });
};

// creates a new node object based on a json spec and returns it
var createNode = function(ivr, spec) {
  if (!spec.id) { throw new Error('node must have id'); }
  if (!spec.method) { throw new Error('node must have method'); }

  var node = JSON.parse(JSON.stringify(spec));
  node.ivr = ivr;

  var module = require('./nodes/' + node.method);
  node.runFunc = module.run;
  node.run = function() {
    // track the visitation of this node by copying it and storing the copy in the node path
    var bread_crumb = _.omit(this, 'ivr');
    bread_crumb.visited = new Date();
    this.ivr.node_path.push(bread_crumb);
    return promisefy(node.runFunc()); 
  };
  
  if (module.resume) {
    node.resumeFunc = module.resume; // makes 'this' inside module.resume point to node
    node.resume = function(input) {
      var bread_crumb = this.ivr.node_path[this.ivr.node_path.length - 1];
      bread_crumb.input = input.Digits || '';
      bread_crumb.input_received = new Date();

      if (!input.Digits) { throw new Error('no input received'); }

      return promisefy(node.resumeFunc(input));
    };
  }

  return node;
};

// creates a new ivr object based on a json spec and returns it
module.exports.create = function(spec) {
  if (!spec.access_number) { throw new Error('IVR must have access_number'); }
  if (! (spec.nodes && spec.nodes.length > 0) ) { 
    throw new Error('IVR must have at least 1 node defined'); 
  }
  if (!spec.default_error_redirect) { throw new Error('IVR must have default_error_redirect'); }

  var ivr = JSON.parse(JSON.stringify(spec));
  
  if (!ivr.model) { ivr.model = {}; }
  if (!ivr.node_path) { ivr.node_path = []; }
  ivr.twiml = new require('twilio').TwimlResponse();
  ivr.nodes = spec.nodes.map(function(elt) { return createNode(ivr, elt); });

  // runs any remaining  (split, gather, etc.)
  // runs the current node
  // takes an optional input argument if ivr is pending input
  // returns a promise resloving with twiml response string
  ivr.run = function(input) {
    var self = this;
    var handleErr = function(err) {
      console.error(err);
      self.model.error = err;
      self.current_node = self.getNode(self.current_node.error_redirect || self.default_error_redirect);
      
      console.log('REDIRECTING TO ' + self.current_node.id + ' BECAUSE OF ERROR');

      return self.current_node.run();
    };
    
    try {
      var result;
      if (this.input_pending) {
	this.input_pending = false;
	if (!this.current_node.resume) { throw new Error('ivr is pending input but ' + this.current_node.id + ' has no resume method'); }
	result = this.current_node.resume(input).then(function() { return self.current_node.run(); });
      } else {
	result = this.current_node.run();
      }
      
      if (Q.isPromise(result)) {
	return result.catch(handleErr);
      }
      return Q.fcall(function() { return result; });
      
    } catch (err) { return handleErr(err); }
  };
  
  // looks up a node by id and returns it.
  // throws an error if no such node exists
  ivr.getNode = function(id) {
    var result = this.nodes.filter(function(elt) { return elt.id === id; });
    
    if (result.length > 1) { throw new Error('multiple nodes with that id' + id + ' exist'); }
    if (result < 1) { throw new Error('no node with id: ' + id + ' exists'); }
    
    return result[0];
  };

  // serializes the ivr object
  ivr.toJSON = function() {
    var json = spec;
    json.current_node_id = this.current_node.id;
    json.model = this.model;
    json.input_pending = this.input_pending;
    json.node_path = this.node_path;
    return JSON.stringify(json);
  };
  
  // if a current node exists, set it, otherwise it should be the first node
  ivr.current_node = spec.current_node_id ? ivr.getNode(spec.current_node_id) : ivr.nodes[0];

  return ivr;
};  


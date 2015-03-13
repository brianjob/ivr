// ivr-factory.js
// Author:      Brian Barton
// Description: Factory that takes a JSON specification and returns an IVR object

var twilio = require('twilio');
var bars   = require('handlebars');
var Q      = require('q');

// creates a new node object based on a json spec and returns it
var createNode = function(ivr, spec) {
  if (!spec.id) { throw new Error('node must have id'); }
  if (!spec.method) { throw new Error('node must have method'); }

  var node = JSON.parse(JSON.stringify(spec));
  node.ivr = ivr;

  var module = require('./' + node.method);
  node.run = module.run;
  
  if (module.resume) {
    node.resume_func = module.resume; // makes 'this' inside module.resume point to node
    node.resume = function(input) {
      var result = node.resume_func(input);

      // resume must always return a promise, so if it doesn't, then construct one
      if (Q.isPromise(result)) {
	return result;
      }
      return Q.fcall(function() { return result; });
    };
  }
  
  return node;
};

// ivr.run()
// runs any preprocess (split, gather, etc.)
// runs the current node
// takes an optional input argument if ivr is pending input
// returns a promise resloving with twiml response string
var run = function(input) {
  var self = this;
  var handleErr = function(err) {
    console.log('HANDLE ERROR');
    console.error(err);
    self.model.error = err;
    self.current_node = self.getNode(self.current_node.error_redirect || self.default_error_redirect);
    return self.current_node.run();
  };

  try {
    var result;
    if (this.input_pending) {
      this.input_pending = false;
      if (!this.current_node.resume) { throw new Error('ivr is pending input but ' + this.current_node.id + ' has no resume method'); }
      result = this.current_node.resume(input).then(function() {
	return self.current_node.run(); 
      });
    } else {
      console.log('CURRENT_NODE.RUN()');
      result = this.current_node.run();
    }
    
    if (Q.isPromise(result)) {
      console.log('RETURN CATCH HANDLE ERROR');
      return result.catch(handleErr);
    }

    return Q.fcall(function() { return result; });

  } catch (err) { return handleErr(err); }
};

// ivr.getNode()
// looks up a node by id
var getNode = function(id) {
  var result = this.nodes.filter(function(elt) {
    return elt.id === id;
  });
  
  if (result.length > 1) { throw new Error('multiple nodes with that id' + id + ' exist'); }

  if (result < 1) { throw new Error('no node with id: ' + id + ' exists'); }

  return result[0];
};

// creates a new ivr object based on a json spec and returns it
module.exports.create = function(spec) {
  if (!spec.domain) { throw new Error('IVR must have domain'); }
  if (!spec.access_number) { throw new Error('IVR must have access_number'); }
  if (! (spec.nodes && spec.nodes.length > 0) ) { 
    throw new Error('IVR must have at least 1 node defined'); 
  }
  if (!spec.default_error_redirect) { throw new Error('IVR must have default_error_redirect'); }

  var ivr = JSON.parse(JSON.stringify(spec));
  
  if (!ivr.model) { ivr.model = {}; }

  ivr.model.domain = spec.domain; // if a model is provided and contains a domain, it will be overwritten here
  ivr.twiml        = new twilio.TwimlResponse();
  ivr.run          = run;
  ivr.getNode      = getNode;

  ivr.toJSON = function() {
    var json = spec;
    json.current_node_id = this.current_node.id;
    json.model = this.model;
    json.input_pending = this.input_pending;
    return JSON.stringify(json);
  };

  // construct each node
  ivr.nodes = spec.nodes.map(function(elt) { return createNode(ivr, elt); });

  // if a current node exists, set it, otherwise it should be the first node
  if (spec.current_node_id) {
    ivr.current_node = ivr.getNode(spec.current_node_id);
  } else {
    ivr.current_node = ivr.nodes[0];
  }

  return ivr;
};  


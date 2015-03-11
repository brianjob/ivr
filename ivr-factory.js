// ivr-factory.js
// Author:      Brian Barton
// Description: Factory that takes a JSON specification and returns an IVR object

var twilio = require('twilio');
var bars   = require('handlebars');
var Q      = require('q');
var split  = require('./split');
var gather = require('./gather');
var say    = require('./say');
var action = require('./action');
var hangup = require('./hangup');

// creates a new node object based on a json spec and returns it
var createNode = function(ivr, spec) {
  if (!spec.id) {
    throw new Error('node must have id');
  }
  if (!spec.method) {
    throw new Error('node must have method');
  }

  var node = JSON.parse(JSON.stringify(spec));
  node.ivr = ivr;

  if (node.method === 'say') {
    node.run = say.run;
  } else if (node.method === 'gather') {
    node.run = gather.run;
    node.gather = gather.gather;
  } else if (node.method === 'split') {
    if (!spec.invalid_input_redirect) { throw new Error('split node must define invalid_input_redirect'); }
    node.run = split.run;
    node.split = split.split;
  } else if (node.method === 'action') {
    node.run = action.run;
  } else if (node.method === 'hangup') {
    node.run = hangup.run;
  } else {
    throw new Error('unknown node method');
  }

  return node;
};

// creates a new ivr object based on a json spec and returns it
var createIVR = function(spec) {
  if (!spec.domain) { throw new Error('IVR must have domain'); }
  if (!spec.access_number) { throw new Error('IVR must have access_number'); }
  if (! (spec.nodes && spec.nodes.length > 0) ) { 
    throw new Error('IVR must have at least 1 node defined'); 
  }
  if (!spec.default_error_redirect) { throw new Error('IVR must have default_error_redirect'); }

  var ivr = {
    domain           : spec.domain,
    access_number    : spec.access_number,
    default_voice    : spec.default_voice,
    default_language : spec.default_language,
    default_timeout  : spec.default_timeout,
    model            : {
      domain : spec.domain
    },
    twiml           : new twilio.TwimlResponse(),
    run             : function() {
      var self = this;
      var handleErr = function(err) {
	console.error(err);
	self.model.error = err;
	self.current_node = self.current_node.error_redirect || self.default_error_redirect;
	console.log('SELF');
	console.dir(self);
	return self.run();
      };

      try {
	var result = this.current_node.run();
	
	if (Q.isPromise(result)) {
	  return result.catch(handleErr);
	}
	return Q.fcall(function() { return result; });
      } catch (err) {
	return handleErr(err);
      }
    },
    getNode         : function(id) {
      var result = this.nodes.filter(function(elt) {
	return elt.id === id;
      });
      
      if (result.length > 1) {
	throw new Error('multiple nodes with that id exist');
      }
      if (result < 1) {
	throw new Error('no node with id: ' + id + ' exists');
      }
      return result[0];
    }, toJSON       : function() {
      var json = spec;
      json.current_node_id = this.current_node.id;
      json.model = this.model;
      return JSON.stringify(json);
    }
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

module.exports.create = createIVR;

var twilio   = require('twilio');
var bars     = require('handlebars');
var split    = require('./split');
var gather   = require('./gather');
var say      = require('./say');

// creates a new node object based on a json spec and returns it
var createNode = function(ivr, spec) {
  if (!spec.id)       { throw new Error('node must have id'); }
  if (!spec.method)   { throw new Error('node must have method'); }
  if (!spec.redirect) { throw new Error('node must have redirect'); }
 
  var node = {
    ivr    : ivr,
    id     : spec.id,
    method : spec.method
  };

  if (node.method === 'say') {
    node.run = say.run;
  } else if (node.method === 'gather') {
    node.run = gather.run;
    node.gather = gather.gather;
  } else if (node.method === 'split') {
    if (!spec.invalid_input_redirect) { throw new Error('split node must define invalid_input_redirect'); }
    node.run = split.run;
    node.split = split.split;
  } else {
    throw new Error('unknown node method');
  }

  return node;
};

// creates a new ivr object based on a json spec and returns it
var createIVR = function(spec) {
  console.log('createIVR()');
  if (!spec.domain) { throw new Error('IVR must have domain'); }
  if (!spec.access_number) { throw new Error('IVR must have access_number'); }
  if (!spec.operator_number) { throw new Error('IVR must have operator_number'); }
  if (! (spec.nodes && spec.nodes.length > 0) ) { 
    throw new Error('IVR must have at least 1 node defined'); 
  }

  var ivr = {
    domain          : spec.domain,
    access_number   : spec.access_number,
    operator_number : spec.operator_number,
    voice           : spec.voice,
    language        : spec.language,
    default_timeout : spec.default_timeout,
    nodes           : spec.nodes.map(function(elt) { return createNode(ivr, elt); }),
    model           : {
      domain : spec.domain
    },
    getNode         : function(id) {
      var result = this.nodes.filter(function(elt) {
	return elt.id === id;
      });
      
      if (result.length > 1) {
	throw new Error('multiple nodes with that id exist');
      }
      if (result < 1) {
	throw new Error('no node with that id exists');
      }
      return result[0];
    },
    run              : function() {
      return this.current_node.run();
    }
  };

  // if a current node exists, set it, otherwise it should be the first node
  if (spec.current_node) {
    ivr.current_node = ivr.getNode(spec.current_node.id);
  } else {
    ivr.current_node = ivr.nodes[0];
  }

  return ivr;
};  

module.exports.create = createIVR;

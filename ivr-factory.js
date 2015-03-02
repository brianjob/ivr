var twilio   = require('twilio');
var template = require('./template');
var bars     = require('handlebars');

var runSay = function(model) {
  if (!this.template) { throw new Error('say node must have template'); }
  var template = bars.compile(this.template);
  
  var twiml = new twilio.TwimlResponse();  
  twiml.say({
    voice    : this.voice    || this.ivr.default_voice,
    language : this.language || this.ivr.default_language,
  }, template(model));
  
  this.ivr.current_node = this.ivr.getNode(this.redirect);
  
  return twiml.toString() + this.ivr.current_node.run(); // recursion kewl
};

var runGather = function() {
  if (!this.prompt) { throw new Error('gather node must have a prompt'); }
  var twiml = new twilio.TwimlResponse();  
  
  twiml.gather({
    action      : '/gather',
    timeout     : this.timeout || this.ivr.default_timeout,
    numDigits   : this.numDigits,
    finsihOnKey : this.finishOnKey
  }, function() {
    this.say({
      voice    : this.voice    || this.ivr.default_voice,
      language : this.language || this.ivr.default_language
    }, this.prompt);
  });

  return twiml.toString();
};

var runSplit = function() {
  if (! (this.paths && this.paths.length > 0) ) { throw new Error('split node must have at least one path'); }

  var twiml = new twilio.TwimlResponse();
  
  var prompt = this.paths.map(function(elt) { 
    return 'Press ' + elt.key + ' to ' + elt.prompt + '.';
  }).reduce(function(a, b) {
    return a + ' ' + b;
  });
  
  twiml.gather({
    action    : '/split',
    timeout   : this.timeout || this.ivr.default_timout,
    numDigits : 1
  }, function() {
    this.say({
      voice    : this.voice    || this.ivr.default_voice,
      language : this.language || this.ivr.default_language
    }, prompt);
  });
  
  return twiml.toString();
};

// creates and returns a run function based on the spec for a node
var createRunMethod = function(method) {

  if (method === 'say') {
    return runSay;
  }
    
  if (method === 'gather') {
    return runGather;
  }
  
  if (method === 'split') {
    return runSplit;
  }
};

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

  node.run = createRunMethod(spec);

  return node;
};

// creates a new ivr object based on a json spec and returns it
var createIVR = function(spec) {
  if (!spec.domain)                             { throw new Error('IVR must have domain'); }
  if (!spec.access_number)                      { throw new Error('IVR must have access_number'); }
  if (!spec.operator_number)                    { throw new Error('IVR must have operator_number'); }
  if (! (spec.nodes && spec.nodes.length > 0) ) { throw new Error('IVR must have at least 1 node defined'); }

  var ivr = {
    domain          : spec.domain,
    access_number   : spec.access_number,
    operator_number : spec.operator_number,
    voice           : spec.voice,
    language        : spec.language,
    default_timeout : spec.default_timeout,
    nodes           : spec.nodes.map(function(elt) { return createNode(ivr, elt); }),
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
    }
  };
};  

module.exports.create = createIVR;

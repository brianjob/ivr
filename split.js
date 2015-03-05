var twilio = require('twilio');

module.exports.run = function() {
  if (! (this.paths && this.paths.length > 0) ) { 
    throw new Error('split node must have at least one path'); 
  }
  
  var prompt = this.paths.map(function(elt) {
    return 'Press ' + elt.key + ' to ' + elt.prompt + '.';
  }).reduce(function(a, b) {
    return a + ' ' + b;
  });
  
  var twiml = new twilio.TwimlResponse();

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

module.exports.split = function(input) {
  var result = this.paths.filter(function(elt) {
    return elt.key === input;
  })[0];

  if (result) {
    this.ivr.current_node = result.redirect;
  } else {
    // user input did not match one of the available paths
    this.ivr.current_node = this.invalid_input_redirect;
  }   
};

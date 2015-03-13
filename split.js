module.exports.run = function() {
  if (!this.invalid_input_redirect) { throw new Error('split node ' + this.id + ' must define invalid_input_redirect'); }
  if (! (this.paths && this.paths.length > 0) ) { 
    throw new Error('split node ' + this.id + '  must have at least one path'); 
  }
  
  var prompt = this.paths.map(function(elt) {
    return 'Press ' + elt.key + ' to ' + elt.prompt + '.';
  }).reduce(function(a, b) {
    return a + ' ' + b;
  });

  var self = this;
  this.ivr.twiml.gather({
    action    : '/',
    timeout   : this.timeout || this.ivr.default_timout,
    numDigits : 1
  }, function() {
    this.say({
      voice    : self.voice    || self.ivr.default_voice,
      language : self.language || self.ivr.default_language
    }, prompt);
  });

  this.ivr.input_pending = true;
  
  return this.ivr.twiml.toString();
};

module.exports.resume = function(input) {
  var result = this.paths.filter(function(elt) {
    return elt.key === input.Digits;
  })[0];

  if (result) {
    this.ivr.current_node = this.ivr.getNode(result.redirect);
  } else {
    // user input did not match one of the available paths
    this.ivr.current_node = this.ivr.getNode(this.invalid_input_redirect);
  }   
};

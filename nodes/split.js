module.exports.run = function() {
  if (!this.invalid_input_redirect) { throw new Error('split node ' + this.id + ' must define invalid_input_redirect'); }
  if (! (this.paths && this.paths.length > 0) ) { 
    throw new Error('split node ' + this.id + '  must have at least one path'); 
  }
  
  var prompt = this.paths.map(function(elt) {
    return elt.prompt + '.';
  }).reduce(function(a, b) {
    return a + ' ' + b;
  });

  var gather_opts = {
    action      : '/',
    numDigits   : 1,
    finishOnKey : ''
  };

  var self = this;
  var say_opts = {};
  if (self.voice || self.ivr.default_voice) { say_opts.voice = self.voice || self.ivr.default_voice; }
  if (self.language || self.ivr.default_language) { say_opts.language = self.language || self.ivr.default_language; }
  if (this.timeout || this.ivr.default_timout) { gather_opts.timeout = this.timeout || this.ivr.default_timout; }

  this.ivr.twiml.gather(gather_opts, function() {
    this.say(say_opts, prompt);
  });

  this.ivr.twiml.redirect({
    method : 'POST',
  }, '/');

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

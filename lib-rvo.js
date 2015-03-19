var ach = function(model) {
  return model;
};


var cc = function(model) {
  return model;
};

module.exports.rvoAllowedACHandCC = function(model) {
  return ach(model) && cc(model);
};

module.exports.rvoAllowedCC = cc;
module.exports.rvoAllowedACH = ach;

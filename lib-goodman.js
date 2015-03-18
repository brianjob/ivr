

module.exports.setGoodmanAccountID = function(model, input) {
  if (model.account_alpha) {
    model.account_id = input.substr(0, 2) + model.account_alpha + input.substr(2);
  } else {
    model.account_id = input;
  }
};

module.exports.setStarkAccountID = function(model, input) {
  model.accountID = model.account_alpha + input;
};

module.exports.setStarkAccountID = function(model, input) {
  model.accountID = model.account_alpha + input;
};

// set the source key based on trust account
module.exports.setStarkSourceKey = function(model) {
  if (!model.usaepay_key_main) { throw new Error('main source key not set'); }
  if (!model.usaepay_key_ford) { throw new Error('ford source key not set'); }
  if (!model.auth.account) { throw new Error('account not yet authenticated'); }

  if (model.auth.account.trust_account === 'FORD') {
    model.usaepay_key = model.usaepay_key_ford;
  } else {
    model.usaepay_key = model.usaepay_key_main;
  }
};

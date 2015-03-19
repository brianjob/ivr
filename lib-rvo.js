var ach = function(model) {
  return model;
};


var cc = function(model) {
  var blacklist_creditor_ids = [
    '328',
    '454',
    '2096',
    '2116',
    '2117',
    '2226',
    '2319',
    '2320',
    '2321',
    '2322',
    '2323',
    '2492',
    '2516',
    '2522',
    '2524',
    '2526',
    '2562'
  ];
    return blacklist_creditor_ids.indexOf(model.auth.account.creditor_id) === -1;
};

module.exports.rvoAllowedACHandCC = function(model) {
  return ach(model) && cc(model);
};

module.exports.rvoAllowedCC = cc;
module.exports.rvoAllowedACH = ach;

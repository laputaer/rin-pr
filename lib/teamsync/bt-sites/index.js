
//exports.BTSiteBase = require('./base');
var btsites_config = require('./../config').bt_sites;

var BTSiteDmhy = require('./dmhy'),
  BTSiteKtxp = require('./ktxp'),
  BTSiteCamoe = require('./camoe'),
  BTSitePopgo = require('./popgo'),
  BTSiteAcgrip = require('./acgrip'),
  BTSiteNyaa = require('./nyaa'),
  BTSiteAcgnx = require('./acgnx'),
  BTSiteAcgnxInt = require('./acgnx_int');

var BTSite = function (site, user_id, category) {
  var bts = null;
  var opts = btsites_config[site];
  switch (site) {
    case 'dmhy':
      bts = new BTSiteDmhy(opts);
      break;
    case 'ktxp':
      bts = new BTSiteKtxp(opts);
      break;
    case 'popgo':
      bts = new BTSitePopgo(opts);
      break;
    case 'camoe':
      bts = new BTSiteCamoe(opts);
      break;
    case 'acgrip':
      bts = new BTSiteAcgrip(opts);
      break;
    case 'nyaa':
      bts = new BTSiteNyaa(opts);
      break;
    case 'acgnx':
      bts = new BTSiteAcgnx(opts);
      break;
    case 'acgnx_int':
      bts = new BTSiteAcgnxInt(opts);
      break;
  }
  if (bts) {
    if (category) {
      bts.setCategory(category);
    }
    if (user_id) {
      bts.setUserId(user_id);
    }
  }
  return bts;
};

exports.BTSite = BTSite;

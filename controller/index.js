
var config = require('./../config');
var mount = require('koa-mount');

var api = require('./api'),
  download = require('./download'),
  rss = require('./rss');

module.exports = function (app) {
  app.use(mount('/api', api.middleware()));
  app.use(mount('/download', download.middleware()));
  app.use(mount('/rss', rss.middleware()));

  //rin-lite
  if (config['web'].liteView) {
    var lite = require('./../lib/rin-lite');
    app.use(mount('/lite', lite.middleware()));
    // static files for rin-lite
    if (config['app'].dev_mode && config['web'].static_file_server) {
      var serve = require('koa-static');
      app.use(mount('/lite', serve('lib/rin-lite/public/lite/')));
    }
  }
};

/**
 * controller/api/index.js
 * Rin prpr!
 *
 * rin-pr api controller
 */

var Router = require('koa-router');
var api = new Router();

require('./user')(api);

module.exports = api;

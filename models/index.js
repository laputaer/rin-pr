var M = require('./base').M;
require('./users');
require('./tags');
require('./bangumis');
require('./torrents');
require('./teams');
require('./files');

exports.Users = M('users');
exports.Tags = M('tags');
exports.Bangumis = M('bangumis');
exports.Torrents = M('torrents');
exports.Teams = M('teams');
exports.Files = M('files');

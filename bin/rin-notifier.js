
var config = require('../config');
var MailNotifier = require('mail-notifier');

var co = require('./../node_modules/koa/node_modules/co');

var Models = require('./../models'),
  Users = Models.Users,
  Torrents = Models.Torrents;
var ObjectID = require('mongodb').ObjectID;

var mailer = require('./../lib/mailer');

var imap = {
  user: config['mail'].user,
  password: config['mail'].password,
  host: config['mail'].imap,
  port: 993, // imap port
  tls: true,// use secure connection
  tlsOptions: { rejectUnauthorized: false }
};

function onerror(err) {
  if (err) {
    console.error(err.stack);
  }
}

function *update(torrent_id) {
  var torrent = new Torrents({_id: torrent_id});
  var t = yield torrent.find();
  if (t) {
    yield torrent.commnetCount();
    if (t.uploader_id) {
      var u = yield new Users({_id: t.uploader_id}).find();
      if (u && u.email && u.receive_email === false) {
        //and send email
        //mailer
        var locale = u.locale ? u.locale : config['app'].def_lang;
        /*yield mailer(u.email, locale, 'torrent_newreply', {
          torrentLink: config['web'].web_domain_prefix + '/torrent/' + t._id
        });*/
      }
    }
  }
}

function updateTorrent(torrent_id) {
  var ctx = new Object();
  var fn = co.wrap(update);
  fn.call(ctx, torrent_id).catch(onerror);
}

var notifier = MailNotifier(imap);

notifier.on('mail', function (mail) {
  if (mail.from && mail.from.length === 1
    && mail.from[0].address === 'notifications@disqus.net') {
    var reUrl = /http\:\/\/redirect\.disqus\.com\/url\?.*?&url=(.+?)%23comment/i;
    var m = mail.text.match(reUrl);
    if (m) {
      var url = decodeURIComponent(m[1]);
      var reTorrentId = /torrent\/([0-9a-f]+)/i;
      m = url.match(reTorrentId);
      if (m) {
        updateTorrent(m[1]);
      }
    }
  }
});

notifier.on('error', function (err) {
  console.log(err);
  if (err && err.code === 'EPIPE') {
    //restart?
    //notifier.start();
  }
});

notifier.start();
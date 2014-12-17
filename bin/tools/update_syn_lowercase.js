
var co = require('./../../node_modules/koa/node_modules/co');
var config = require('./../../config');
var models = require('./../../models'),
  Tags = models.Tags;

var main = module.exports = function *() {
  var tag = new Tags();
  var tags = yield tag.getAll();
  for (var i = 0; i < tags.length; i++) {
    var t = tags[i];
    var upd = {};
    if (!t.synonyms) {
      t.synonyms = [t.name];
      upd.synonyms = t.synonyms;
    } else if (t.synonyms.indexOf(t.name) < 0) {
      t.synonyms.push(t.name);
      upd.synonyms = t.synonyms;
    }
    if (!t.syn_lowercase) {
      t.syn_lowercase = Tags.lowercaseArray(t.synonyms);
      upd.syn_lowercase = t.syn_lowercase;
    } else {
      var la = Tags.lowercaseArray([t.name]);
      if (t.syn_lowercase.indexOf(la[0]) < 0) {
        t.syn_lowercase.push(la[0]);
        upd.syn_lowercase = t.syn_lowercase;
      }
    }
    var ha = false;
    for (var k in upd) {
      ha = true;
      break;
    }
    if (ha) {
      tag._id = t._id;
      yield tag.update(upd);
      console.log(t.name, upd);
    }
  }

  process.exit(0);
};

function onerror(err) {
  if (err) {
    console.error(err.stack);
  }
}

setTimeout(function () {
  var ctx = new Object();
  var fn = co(main);
  fn.call(ctx, onerror);
}, 800);


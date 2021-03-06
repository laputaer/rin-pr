var validator = require('validator'),
    _ = require('underscore'),
    common = require('./../../lib/common');
var Models = require('./../../models'),
    Archives = Models.Archives,
    Tags = Models.Tags;

module.exports = function (api) {

    api.post('/tag/add', function *(next) {
        if (this.user && this.user.isStaff()) {
            var body = this.request.body;
            if (body && body.name && body.type
                && body.synonyms instanceof Array
                && typeof body.locale == 'object') {
                body.name = validator.trim(body.name);
                body.type = validator.trim(body.type);
                if (body.name && body.type) {
                    var tag = new Tags({
                        name: body.name,
                        type: body.type,
                        synonyms: body.synonyms,
                        locale: body.locale
                    });
                    if (tag.valid()) {
                        var t = yield tag.save();
                        if (t) {
                            this.body = {success: true, tag: tag.valueOf()};
                            return;
                        }
                    }
                }
            }
        }
        this.body = {success: false};
    });

    api.post('/tag/update', function *(next) {
        if (this.user && this.user.isStaff()) {
            var body = this.request.body;
            if (body && body._id && body.name && body.type
                && body.synonyms instanceof Array
                && typeof body.locale == 'object'
                && validator.isMongoId(body._id)) {
                body.name = validator.trim(body.name);
                body.type = validator.trim(body.type);
                if (body.name && body.type) {
                    var tag = new Tags({
                        _id: body._id,
                        name: body.name,
                        type: body.type,
                        synonyms: body.synonyms,
                        locale: body.locale
                    });
                    if (tag.valid()) {
                        var t = yield tag.update();
                        if (t) {
                            this.body = {success: true, tag: tag.valueOf()};
                            return;
                        }
                    }
                }
            }
        }
        this.body = {success: false};
    });

    api.post('/tag/remove', function *(next) {
        if (this.user && this.user.isStaff()) {
            var body = this.request.body;
            if (body && body._id && validator.isMongoId(body._id)) {
                var tag = new Tags({_id: body._id});
                var t = yield tag.find();
                if (t) {
                    // add tag removal log
                    console.log(this.user.username + ' removed tag: ' + body._id);

                    var archive = new Archives({
                        type: 'tag',
                        user_id: this.user._id,
                        data: t
                    });
                    yield archive.save();

                    yield tag.remove();
                    this.body = {success: true};
                    return;
                }
            }
        }
        this.body = {success: false};
    });

    api.get('/tag/all', function *(next) {
        this.body = yield new Tags().getAll();
    });

    api.get('/tag/popbangumi', function *(next) {
        this.body = yield new Tags().getPopBangumis();
    });

    api.get('/tag/common', function *(next) {
        this.body = yield new Tags().getByType(['lang', 'resolution', 'format', 'misc']);
    });

    api.get('/tag/team', function *(next) {
        this.body = yield new Tags().getPopTeams();
    });

    api.get('/tag/misc', function *(next) {
        this.body = yield new Tags().getByType('misc');
    });

    api.post('/tag/search', function *(next) {
        var body = this.request.body;
        if (body && body.name) {
            body.name = validator.trim(body.name);
            body.type = validator.trim(body.type);
            if (body.name) {
                var t;
                if (body.keywords) {
                    t = yield new Tags().searchByKeywords(body.name, body.type);
                } else {
                    t = yield new Tags().matchTags([body.name]);
                }
                if (t && t[0]) {
                    if (body.multi) {
                        this.body = {success: true, found: true, tag: t};
                    } else {
                        this.body = {success: true, found: true, tag: t[0]};
                    }
                } else {
                    this.body = {success: true, found: false};
                }
                return;
            }
        }
        this.body = {success: false};
    });

    api.post('/tag/suggest', function *(next) {
        if (this.request.body) {
            var query = this.request.body.query;
            var sarr = common.title_split(query);
            var tags = yield new Tags().matchTags(sarr);
            /* disabled
            //remove misc
            for (var i = tags.length - 1; i >= 0; i--) {
                if (tags[i].type == 'misc') {
                    tags.splice(i, 1);
                }
            }
            */
            this.body = tags;
            return;
        }
        this.body = [];
    });

    api.post('/tag/fetch', function *(next) {
        var body = this.request.body;
        if (body) {
            if (body._ids && validator.isMongoIdArray(body._ids)) {
                this.body = yield new Tags().find(body._ids);
                return;
            } else if (body._id && validator.isMongoId(body._id)) {
                this.body = yield new Tags().find(body._id);
                return;
            }
        }
        this.body = '';
    });

};

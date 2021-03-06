"use strict";

var config = require('./../config');

var util = require('util');
var fs = require('fs');
var path = require('path');
var mkdirp = require('mkdirp');

var ModelBase = require('./base');
var ObjectID = require('mongodb').ObjectID;

function Files(file) {
  ModelBase.call(this);
  if (file) {
    if (file._id) this._id = file._id;
  }
}

util.inherits(Files, ModelBase);

Files.prototype.load = function (type, file, user_id) {
  this._valid = true;

  this.filename = file.filename;
  this.savename = file.savename;
  this.path = file.savepath;
  this.extname = file.extname;
  this.uploader_id = new ObjectID(user_id);

  switch (this.extname) {
    case '.torrent':
      this.type = 'torrent';
      break;
    case '.jpg':
    case '.png':
    case '.webp':
    case '.bmp':
    case '.gif':
      this.type = 'image';
      break;
    default:
      this._valid = false;
      break;
  }
  if (type && this.type !== type) {
    this._valid = false;
  }
};

Files.prototype.valid = function () {
  return this._valid;
};

Files.prototype.valueOf = function () {
  return {
    _id: this._id,
    type: this.type,
    filename: this.filename,
    filesize: this.filesize,
    savepath: this.savepath,
    uploader_id: this.uploader_id,
    uploadDate: this.uploadDate,
  };
};

Files.prototype.setFilename = function (filename) {
  this.savename = filename;
};

Files.prototype.preSave = function (savepath) {
  var that = this;
  return function (callback) {
    mkdirp(config['sys'].public_dir + savepath, function (err, md) {
      fs.stat(that.path, function (err, stat) {
        if (err) {
          return callback(err);
        }

        savepath += '/' + that.savename + that.extname;
        var newpath = path.join(config['sys'].public_dir, savepath);

        fs.rename(that.path, newpath, function (err) {
          if (err) {
            return callback(err);
          }

          var f = {
            type: that.type,
            filename: that.filename,
            filesize: stat['size'],
            savepath: savepath,
          };

          callback(null, f);
        });
      });
    });
  };
};

Files.prototype.save = function *() {
  var date = new Date();
  var mm = String(date.getUTCMonth() + 1);
  var dd = String(date.getUTCDate());
  if (mm.length < 2) mm = '0' + mm;
  if (dd.length < 2) dd = '0' + dd;

  //use unix path format
  var savepath = 'data/' + this.type + 's/' + date.getUTCFullYear().toString() + '/' + mm;
  if (this.type === 'torrent') {
    savepath += '/' + dd;
  }

  var f = yield this.preSave(savepath);
  if (f) {
    f.uploader_id = this.uploader_id;
    f.uploadDate = new Date();
    return yield this.insert(f);
  }

  return null;
};

module.exports = Files;

ModelBase.register('files', Files);

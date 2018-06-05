var express = require('express');
var router = express.Router();
var fs = require('fs');
var path = require('path');
var _ = require('lodash');

function readArrayOfFilesInDir(dir, filenames, cb) {
  if (!_.isArray(filenames)) {
    cb(new TypeError('filenames must be an array'));
  }

  var filesLeftToRead = filenames.length;
  var files = {};

  filenames.forEach(function(filename) {
    fs.readFile(path.join(dir, filename), 'utf8', function(err, content) {
      if (err) {
        return cb(err);
      }

      files[filename] = content;
      filesLeftToRead--;

      if (!filesLeftToRead) {
        cb(null, files);
      }
    });
  });
}

function readAllFilesInDir(dir, cb) {
  fs.readdir(dir, function(err, filenames) {
    if (err) {
      return cb(err);
    }

    readArrayOfFilesInDir(dir, filenames, cb);
  });
}

var defaultFiles;

function formatDefaultFiles(defaultFilesObj) {
  return _.map(defaultFilesObj, function(val, key) {
    return {
      name: key,
      content: new Buffer(val).toString('base64')
    };
  });
}

function cacheDefaultFiles(cb) {
  readAllFilesInDir(path.join(__dirname, '../content/default-files'), function(err, files) {
    if (err) {
      cb(err);
    }

    defaultFiles = formatDefaultFiles(files);
    cb(null, defaultFiles);
  });
}

cacheDefaultFiles(_.noop);

router.get('/readme', function(req, res, next){
  fs.readFile(path.join(__dirname, '../', 'content', 'README-template.md'), function(err, data){
    if(err){
      return next(err);
    }

    var readme = data.toString();
    readme = readme.replace(/:owner\/:repo/g, req.query.repo);
    readme = readme.replace(/:repo/g, req.query.repo.split('/')[1]);

    var base64 = new Buffer(readme).toString('base64');
    return res.send(base64);
  });
});

router.get('/cards', function(req, res, next){
  var type = req.query.type;

  fs.readFile(path.join(__dirname, '../', 'content', 'cards-' + type + '.json'), 'utf8', function(err, data){
    if(err){
      return next(err);
    }

    var cardsMetadata = JSON.parse(data);

    var contentDir = path.join(__dirname, '..', 'content', 'cards', type);
    var fileNames = cardsMetadata.map(function (metaData) {
      return metaData.file;
    });

    readArrayOfFilesInDir(contentDir, fileNames, function(err, files) {
      if (err) {
        next(err);
      }

      var cards = _.map(cardsMetadata, function(metadata){
        return {
          title: metadata.title,
          labels: metadata.labels,
          description: files[metadata.file]
        };
      });

      res.json(cards);
    });
  });
});

router.get('/default-files', function(req, res, next) {
  if (!defaultFiles) {
    cacheDefaultFiles(function(err, defaultFiles) {
      if (err) {
        next(err);
      }

      res.json(defaultFiles);
    });
  } else {
    res.json(defaultFiles);
  }
});

module.exports = router;

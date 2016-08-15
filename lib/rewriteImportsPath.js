var fs = require('fs.extra');
var path = require('path');
var _ = require('lodash');

var libPath = './lib/';

module.exports = function (localImportsData, dir) {

  if (!localImportsData.length) {
    return;
  }

  //console.log(localImportsData)

  dir = dir || process.cwd();

  var rootFiles = [];
  var libFiles = [];
  var extRegex = /(\.(js|jsx)$)/i;
  var libRegex = /((lib)$)/i;

  fs.walk(dir)
    .on('file', function (root, stat, next) {
      var currFile = stat.name;
      var filepath = path.join(root, stat.name);

      if (extRegex.test(currFile)) {
        (root === dir) && rootFiles.push({base: root, file: currFile, path: filepath});
        (libRegex.test(root)) && libFiles.push({base: root, file: currFile, path: filepath});
      }
      next();
    })
    .on('end', function () {
      //console.log(rootFiles);
      //console.log(libFiles);

      var rootSrcArr = localImportsData.filter(function (f) {
        return (f.indexOf('..') == 0 || f.match(new RegExp('/', 'g')).length > 1);
      });
      var rootReplaceArr = rootSrcArr.map(function (src) {
        var currFile = path.basename(src);
        var relPath = (_.findIndex(rootFiles, {file: currFile}) !== -1) ? '../' : './';
        return relPath + currFile;
      });

      var libSrcArr = localImportsData.filter(function (f) {
        return (f.match(new RegExp('/', 'g')).length > 1)
      });
      var libReplaceArr = libSrcArr.map(function (src) {
        src = src.replace(/^(\.{1,2}[\\\/])*/, '');
        return libPath + src;
      });

      var mapRootReplace = _.zipObject(rootSrcArr, rootReplaceArr);
      var mapLibReplace = _.zipObject(libSrcArr, libReplaceArr);

      rewriteImport(rootFiles, mapLibReplace);
      rewriteImport(libFiles, mapRootReplace);

    });

  function rewriteImport(filesArr, dataMap) {
    filesArr.forEach(function (file) {
      file = file.path;
      fs.readFile(file, 'utf8', function (err, data) {
        if (!err) {
          var re = new RegExp(Object.keys(dataMap).join('|'), 'gi');
          var result = data.replace(re, function (matched) {
            return dataMap[matched];
          });
          fs.writeFileSync(file, result);
        }
      });
    });
  }
};
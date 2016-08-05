var fs = require('fs.extra');
var path = require('path');
var _ = require('lodash');

var tempData = {
  modules: [
    'react',
    'canvas-text-wrapper',
    'glob',
    'background-cover',
    'scrollbar-width'
  ],
  localImports: [
    './1/test-1',
    './1/test-2.js',
    './test-4.js',
    '../2/test-3',
    './test-1',
    '../1/test-1.js',
    './test-5.jsx'
  ],
  files: [
    '/Users/vadim/modules/test/1/test-1.js',
    '/Users/vadim/modules/test/1/test-2.js',
    '/Users/vadim/modules/test/2/test-3.js',
    '/Users/vadim/modules/test/2/test-5.jsx'
  ]
};

var libPath = './lib/';

module.exports = function (data, dir) {
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
      //console.log(root, filepath);
      next();
    })
    .on('end', function () {
      //console.log(rootFiles);
      //console.log(libFiles);

      var rootSrcArr = tempData.localImports.filter(function (f) {
        return (f.indexOf('..') == 0 || f.match(new RegExp('/', 'g')).length > 1);
      });
      var rootReplaceArr = rootSrcArr.map(function (src) {
        return '../' + path.basename(src);
      });

      var libSrcArr = tempData.localImports.filter(function (f) {
        return (f.match(new RegExp('/', 'g')).length > 1)
      });
      var libReplaceArr = libSrcArr.map(function (src) {
        return libPath + path.basename(src);
      });

      var mapRootReplace = _.zipObject(rootSrcArr, rootReplaceArr);
      var mapLibReplace = _.zipObject(libSrcArr, libReplaceArr);

      //rewriteRootFiles(rootFiles, mapLibReplace);
      //rewriteLibFiles(libFiles, mapRootReplace);
      console.log(mapRootReplace)

      return

    });

  function rewriteRootFiles(rootFiles, dataMap) {
    rootFiles.forEach(function (file) {
      file = file.path;
      fs.readFile(file, 'utf8', function (err, data) {
        if (err) {
          console.log(err)
        } else {
          var re = new RegExp(Object.keys(dataMap).join('|'), 'gi');
          var result = data.replace(re, function (matched) {
            return dataMap[matched];
          });
          fs.writeFileSync(file, result);
        }
      });
    });
  }

  function rewriteLibFiles(libFiles, dataMap) {
    libFiles.forEach(function (file) {
      console.log(file);
      file = file.path;
      fs.readFile(file, 'utf8', function (err, data) {
        if (err) {
          console.log(err)
        } else {
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
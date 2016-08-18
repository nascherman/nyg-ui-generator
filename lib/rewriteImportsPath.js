var fs = require('fs.extra');
var path = require('path');
var _ = require('lodash');

module.exports = function (localImportsData, localImportsDir, targetDir) {

  var rootFiles = [];
  var libFiles = [];
  var importsData = [];
  var rootFilesReplaceMap = {};
  var libFilesReplaceMap = {};

  var libPath = './lib/';
  var cwd = process.cwd();

  localImportsData.forEach(function (relPath, i) {
    process.chdir(localImportsDir[i]);

    process.nextTick(function () {
      var file = path.resolve(relPath);
      var base = path.dirname(file);
      importsData.push({base: base, file: file, relPath: relPath, isRootFile: (base === cwd)});

      if (i === localImportsData.length - 1) {
        importsData = _.uniq(importsData);
        setReplaceData();
        walk();
      }
    })
  });

  var extRegex = /(\.(js|jsx)$)/i;
  var libRegex = new RegExp(targetDir + '/lib', 'i');

  function setReplaceData() {
    importsData.filter(function (data) {
      return !data.isRootFile && data.relPath.match(new RegExp('/', 'g')).length > 1;
    }).forEach(function (data) {
      var from = data.relPath;
      var to = libPath + data.relPath.replace(/^(\.{1,2}[\\\/])*/, '');
      rootFilesReplaceMap[from] = to;
    });

    importsData.filter(function (data) {
      return data.isRootFile;
    }).forEach(function (data) {
      try {
        var re = /(\.(js|jsx)$)/i;
        var currFile = path.resolve(re.test(data.file) ? data.file : data.file + '.js');
        fs.accessSync(currFile);
        var from = data.relPath;
        var to = '../' + data.relPath;
        libFilesReplaceMap[from] = to;
      } catch (e) {

      }
    });
  }

  function walk() {
    fs.walk(targetDir)
      .on('file', function (root, stat, next) {
        var currFile = stat.name;
        var filePath = path.join(root, stat.name);

        if (extRegex.test(currFile)) {
          if (path.dirname(filePath) === targetDir) {
            rootFiles.push({base: root, file: currFile, path: filePath});
          } else {
            if (libRegex.test(root)) {
              libFiles.push({base: root, file: currFile, path: filePath});
            }
          }
        }
        next();
      })
      .on('end', function () {
        rewriteImports(rootFiles, rootFilesReplaceMap);
        rewriteImports(libFiles, libFilesReplaceMap);
        //console.log(rootFiles, libFiles)
      });
  }

  function rewriteImports(filesArr, dataMap) {
    //console.log(filesArr)
    //console.log(dataMap)

    filesArr.forEach(function (file) {
      file = file.path;
      fs.readFile(file, 'utf8', function (err, data) {
        if (!err) {
          var re = new RegExp(Object.keys(dataMap).join('|'), 'gi');
          if (re.toString() !== (/(?:)/gi).toString()) {
            var result = data.replace(re, function (matched) {
              return dataMap[matched];
            });
            fs.writeFileSync(file, result);
          }
        }
      });
    });
  }
};
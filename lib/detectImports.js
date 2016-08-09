/*
 This script will detect component dependencies (modules and local one) based on imports/require
 */

var fs = require('fs.extra');
var path = require('path');
var detectImport = require('detect-import-require');
var acorn = require('acorn-jsx');
var filterModules = require('filter-npm-modules');
var _ = require('lodash');
var chalk = require('chalk');

module.exports = function (configs, globs, opts, callback) {
  console.warn(chalk.bgMagenta('PROCESSING:'), chalk.magenta('dependencies list is building'));

  var modules = [];
  var localImports = [];
  var files = [];

  var sep = path.sep;
  var cwd = process.cwd();

  var indexFile = configs.rename || 'index.js';
  var indexPath = path.join(cwd, indexFile);
  var indexIncludeList = getCurrFileImports(indexPath);

  findDepsRecursively(indexIncludeList, '.');

  function getCurrFileImports(filePath, currFileFolder) {
    var basePath = path.dirname(filePath);
    var baseName = path.basename(filePath);

    if (basePath !== cwd) {
      // handle sub-folders './' imports
      if (filePath.startsWith('./') && currFileFolder !== '.') {
        basePath = currFileFolder;
      }

      // parse relative file path and replace it with absolute path
      var re = new RegExp('../', 'gi');
      var hasSingleLevelUp = (basePath.match(re) || []).length <= 1;
      if (currFileFolder !== '.' && hasSingleLevelUp) {
        basePath = basePath.replace(/^(..)/mg, '');
      }
      filePath = path.normalize(cwd + sep + basePath + sep + baseName);

      // add file to be copied to the 'lib' but skip it is in component's root
      if (basePath !== '.') {
        files = _.union(files, [filePath]);
      }
    }

    var src = fs.readFileSync(filePath, 'utf8');
    var ast = acorn.parse(src, {
      ecmaVersion: 6,
      sourceType: 'module',
      allowReserved: true,
      allowReturnOutsideFunction: true,
      allowHashBang: true,
      plugins: {
        jsx: true,
      }
    });

    return detectImport(ast);
  }

  var count = 0;

  function findDepsRecursively(list, currPath) {
    count++;

    filterModules(list, function (currListNpmModules) {
      modules = _.union(modules, currListNpmModules);

      var currListLocalImports = _.xor(list, currListNpmModules);
      var tempImports = _.union(localImports, currListLocalImports);

      if (currListLocalImports.length && _.xor(tempImports, localImports).length) {
        localImports = _.union(localImports, tempImports);

        currListLocalImports.forEach(function (p) {
          var currFile;
          try {
            var re = /(\.(js|jsx)$)/i;
            var ext = re.test(p) ? '' : '.js';
            currFile = p + ext;
          } catch (e) {
            currFile = p + '/index.js';
          }

          var includes = getCurrFileImports(currFile, currPath);
          var newPath = p.slice(0, p.lastIndexOf('/') + 1);
          findDepsRecursively(includes, newPath);
        });
      }

      if (!count) { // end of recursion
        localImports = files.map(function (f) {
          return path.resolve(f);
        }).filter(function (f) {
          return path.dirname(f) !== cwd;
        });

        opts.depsData = {modules: modules, localImports: localImports, files: files};

        var commonPath = (localImports.length) ? findCommonBasePath(localImports) : '';

        files.forEach(function (f) {
          var output = path.dirname(f.replace(commonPath, ''));
          output = (output === '/') ? '' : output;

          globs.push({
            base: path.dirname(f),
            glob: path.basename(f),
            output: '/lib/' + output
          });
        });

        //console.log(globs);
        callback && callback();
      }

      count--;
    });
  }

  function findCommonBasePath(array) {
    array = array.sort().map(function (f) {
      return path.dirname(f);
    });

    var first = array[0];
    var last = array[array.length - 1];
    var i = 0;
    while (i < first.length && first.charAt(i) === last.charAt(i)) i++;

    return first.substring(0, i);
  }
};
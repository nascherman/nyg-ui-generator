/*
 This script will detect component dependencies (modules and local one) based on imports/require
 */

var fs = require('fs.extra');
var path = require('path');
var detectImport = require('detect-import-require');
var acorn = require('acorn-jsx');
var filterNpmModules = require('filter-npm-modules');
var _ = require('lodash');
var chalk = require('chalk');
var findCommonBasePath = require('./findCommonPath');

module.exports = function (configs, globs, opts, callback) {
  console.warn(chalk.bgMagenta('PROCESSING:'), chalk.magenta('dependencies list is building'));

  var modules = [];
  var localImports = [];
  var files = [];

  var sep = path.sep;
  var cwd = process.cwd();

  var indexFile = configs.rename || 'index.js';
  var indexPath = path.join(cwd, indexFile);

  walk(getCurrFileImports(indexPath), '.');

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

      files = _.union(files, [filePath]);
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

  function walk(list, currPath) {
    count++;

    filterNpmModules(list, function (currListNpmModules) {
      modules = _.union(modules, currListNpmModules);

      var currListLocalImports = _.xor(list, currListNpmModules);
      var tempImports = _.union(localImports, currListLocalImports);

      if (currListLocalImports.length && _.xor(tempImports, localImports).length) {
        localImports = _.union(localImports, tempImports);

        currListLocalImports.forEach(function (f) {
          var re = /(\.(js|jsx)$)/i;
          var currFile = re.test(f) ? f : f + '.js';

          var includes = getCurrFileImports(currFile, currPath);
          var newPath = f.slice(0, f.lastIndexOf('/') + 1);
          walk(includes, newPath);
        });
      }

      if (!count) {
        // end of recursion
        setGlobs();
        callback && callback();
        return;
      }

      count--;
    });

    function setGlobs() {
      opts.depsData = {modules: modules, localImports: localImports, files: files};

      var localImportsAbsPaths = files.map(function (f) {
        return path.resolve(f);
      });

      var commonPath = (localImports.length) ? findCommonBasePath(localImportsAbsPaths) : '';

      files.forEach(function (f) {
        if (path.dirname(f) !== cwd) {
          var output = path.dirname(f.replace(commonPath, ''));
          output = (output === '/') ? '' : output;
          globs.push({
            base: path.dirname(f),
            glob: path.basename(f),
            output: '/lib/' + output
          });
        }
      });

      //console.log(globs);
    }
  }
};
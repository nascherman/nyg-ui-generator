/*
 This script will detect component dependencies based on imports/require
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

  var indexFile = configs.rename || 'index.js';
  var base = path.resolve(path.dirname(indexFile));
  var indexPath = path.join(process.cwd(), indexFile);
  var indexIncludeList = getIncludes(indexPath);

  findDepsRecursive();

  function getIncludes(file, currPath) {
    var basePath = path.dirname(file);

    if (file.startsWith('./') && currPath !== '.') {
      basePath = currPath;
    }

    if (basePath.startsWith('.')) {
      if (currPath !== '.') {
        basePath = basePath.replace(/^(..|.)/mg, '');
      }
      file = path.resolve(base + path.sep + basePath + path.sep + path.basename(file));
    }

    // skip files from component root so that they are not eventually added to 'lib' folder
    if (basePath !== '.' && basePath !== process.cwd()) {
      files = _.union(files, [path.normalize(file)]);
    }

    var src = fs.readFileSync(file, 'utf8');

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

  function findDepsRecursive(list, currPath) {
    list = list || indexIncludeList;
    currPath = currPath || '.';

    count++;

    filterModules(list, function (currListNpmModules) {
      modules = _.union(modules, currListNpmModules);

      var currListLocalImports = _.xor(list, currListNpmModules);
      var tempImports = _.union(localImports, currListLocalImports);

      if (currListLocalImports.length && _.xor(tempImports, localImports).length) {
        localImports = _.union(localImports, tempImports);

        currListLocalImports.map(function (p) {
          var currFile;

          try {
            var re = /(\.(js|jsx)$)/i;
            var ext = re.test(p) ? '' : '.js';
            currFile = p + ext;
          } catch (e) {
            currFile = p + '/index.js';
          }

          var includes = getIncludes(currFile, currPath);

          var newPath = p.slice(0, p.lastIndexOf('/') + 1);
          findDepsRecursive(includes, newPath);
        });
      }

      if (!count) {
        //console.log(modules);
        //console.log(localImports);
        //console.log(files);

        opts.depsData = {modules: modules, localImports: localImports, files: files};

        files.forEach(function (f) {
          globs.push({
            base: path.dirname(f),
            glob: path.basename(f),
            output: '/lib'
          });
        });

        callback && callback();
      }

      count--;
    });
  }
};
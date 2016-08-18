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
  var localImportsDir = [];
  var files = [];

  var done = false;

  var cwd = process.cwd();
  var indexFile = configs.rename || 'index.js';

  getCurrFileImports(path.join(cwd, indexFile));

  function getCurrFileImports(file) {

    if (_.indexOf(files, file) !== -1) {
      return;
    }

    fs.readFile(file, 'utf8', function (err, data) {
      var ast = acorn.parse(data, {
        ecmaVersion: 6,
        sourceType: 'module',
        allowReserved: true,
        allowReturnOutsideFunction: true,
        allowHashBang: true,
        plugins: {
          jsx: true,
        }
      });

      process.chdir(path.dirname(file));

      var imports = detectImport(ast);
      files = _.union(files, [file]);

      process.nextTick(function () {
        walk(imports);
      })
    });

    process.on('beforeExit', onComplete);
  }

  function walk(list) {
    filterNpmModules(list, function (currNpmModules) {
      modules = _.union(modules, currNpmModules);

      var currLocalImports = _.xor(list, currNpmModules);
      var tempImports = _.union(localImports, currLocalImports);

      if (currLocalImports.length && _.xor(tempImports, localImports).length) {
        localImports = _.union(localImports, tempImports);

        localImports.forEach(function (f, index) {
          var re = /(\.(js|jsx)$)/i;
          var currFile = path.resolve(re.test(f) ? f : f + '.js');

          fs.walk(currFile).on('file', function (root, fileStats, next) {
            next();
            getCurrFileImports(currFile);
            localImportsDir.push(process.cwd());
          });
        });
      }
    });
  }

  function setGlobs() {
    opts.depsData = {modules: modules, localImports: localImports, localImportsDir: localImportsDir};

    var commonPath = (localImports.length) ? findCommonBasePath(files) : '';

    files.forEach(function (f) {
      if (path.dirname(f) !== cwd) {
        var output = path.dirname(f.replace(commonPath, ''));
        output = (output === '/') ? '' : output;
        globs.push({
          base: path.dirname(f),
          glob: path.basename(f),
          output: path.join('/lib', output)
        });
      }
    });

    //console.log(globs);
  }

  function onComplete() {
    if (!done) {
      done = true;
      process.chdir(cwd);
      setGlobs();
      callback && callback();
      console.log('Done!')
    }
  }
};
/*
 This script will detect component dependencies based on imports/require
 */

const fs = require('fs.extra');
const path = require('path');
const detectImport = require('detect-import-require');
const acorn = require('acorn-jsx');
const filterModules = require('filter-npm-modules');
const _ = require('lodash');
const chalk = require('chalk');

module.exports = (configs, globs, opts, callback) => {
  console.warn(chalk.bgMagenta('PROCESSING:'), chalk.magenta(`dependencies list is building`));

  var modules = [];
  var localImports = [];
  var files = [];

  const indexFile = configs.rename || 'index.js';
  const base = path.resolve(path.dirname(indexFile));
  const indexPath = path.join(process.cwd(), indexFile);
  const indexIncludeList = getIncludes(indexPath);

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

    const src = fs.readFileSync(file, 'utf8');

    const ast = acorn.parse(src, {
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

  function findDepsRecursive(list = indexIncludeList, currPath = '.') {
    count++;

    filterModules(list, (currListNpmModules) => {
      modules = _.union(modules, currListNpmModules);

      const currListLocalImports = _.xor(list, currListNpmModules);
      const tempImports = _.union(localImports, currListLocalImports);

      if (currListLocalImports.length && _.xor(tempImports, localImports).length) {
        localImports = _.union(localImports, tempImports);

        currListLocalImports.map((p) => {
          const re = /(\.(js|jsx)$)/i;
          const ext = re.test(p) ? '' : '.js';
          const currFile = p + ext;

          const includes = getIncludes(currFile, currPath);

          const newPath = p.slice(0, p.lastIndexOf('/') + 1);
          findDepsRecursive(includes, newPath);
        });
      }

      if (!count) {
        //console.log(modules);
        //console.log(localImports);
        //console.log(files);

        opts.moduleDeps = modules;

        files.forEach((f)=> {
          globs.push({
            base: path.dirname(f),
            glob: path.basename(f),
            output: '/lib'
          });
        });

        //console.log(globs);

        callback && callback();
      }

      count--;
    });
  }
};
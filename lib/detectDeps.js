const fs = require('fs.extra');
const path = require('path');
const detectImport = require('detect-import-require');
const acorn = require('acorn-jsx');
const filterModules = require('filter-npm-modules');
const _ = require('lodash');
const chalk = require('chalk');

module.exports = (configs, globs, opts, callback) => {
  console.warn(chalk.bgMagenta('PROCESSING:'), chalk.magenta(`be patient while dependencies list is building`));

  var modules = [];
  var localImports = [];
  var files = [];

  const indexFile = configs.rename || 'index.js';
  const base = path.resolve(path.dirname(indexFile));
  const indexPath = path.join(process.cwd(), indexFile);
  const indexIncludeList = getIncludes(indexPath);

  findDepsRecursive();

  function getIncludes(file) {
    var basePath = path.dirname(file);

    if (basePath.startsWith('.')) {
      basePath = basePath.replace(/^[.]/mg, '').replace(/^[.]/, '');
      file = base + path.sep + basePath + path.sep + path.basename(file);
    }

    const src = fs.readFileSync(file, 'utf8');

    const ast = acorn.parse(src, {
      ecmaVersion: 6,
      sourceType: 'module',
      allowReserved: true,
      allowReturnOutsideFunction: true,
      allowHashBang: true,
      plugins: {
        jsx: true
      }
    });

    return detectImport(ast);
  }

  var count = 0;

  function findDepsRecursive(list = indexIncludeList) {
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

          var currFile = p + ext;
          const includes = getIncludes(currFile);

          currFile = currFile.replace(/^[.]/mg, '').replace(/^[.]/, '');
          const filePath = [process.cwd() + currFile];
          files = _.union(files, filePath);

          findDepsRecursive(includes);
        });
      }

      if (!count) {
        //console.log(modules)
        //console.log(localImports)
        //console.log(files)

        opts.moduleDeps = modules;

        files.forEach((f)=> {
          globs.push({
            base: path.dirname(f),
            glob: path.basename(f),
            output: '/lib'
          });
        });

        //console.log(globs)

        callback && callback();
      }

      count--;
    });
  }
};
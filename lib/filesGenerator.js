/*
 Generates only boilerplate files
 */

const nyg = require('nyg');
const chalk = require('chalk');
const open = require('opn');
const fs = require('fs');
const path = require('path');

console.log(chalk.bgYellow('YOUR CWD:'), chalk.yellow(process.cwd()));

const prompts = [
  {
    'name': 'location',
    'message': 'Where would you like to create your component folder?',
    'default': process.cwd()
  },
  {
    type: "input",
    name: "folder",
    message: "Component folder name:",
    default: "MyComponent"
  }
];

const globs = [
  {base: path.join(__dirname, 'templates/{{type}}/'), glob: '*.js', output: '/'},
  {base: path.join(__dirname, 'templates/{{type}}/'), glob: '*.scss', output: '/'},
  {base: path.join(__dirname, 'templates/{{type}}/'), glob: '*.less', output: '/'},
  {base: path.join(__dirname, 'templates/{{type}}/'), glob: '*.hbs', output: '/'}
];

module.exports = (externalPrompts) => {
  var outputDir;

  globs.forEach((g) => g.base = path.relative(__dirname, g.base));

  const gen = nyg(prompts, globs)
    .on('postprompt', () => {
      const done = gen.async();
      outputDir = path.join(gen.config.get('location'), gen.config.get('folder'));

      // check if directory exists
      fs.access(outputDir, (err) => {
        if (!err) {
          const contents = fs.readdirSync(outputDir);
          contents.forEach((item, index) => {
            (item.indexOf('.') === 0) && contents.splice(index, 1);
          });
          if (contents.length) {
            console.warn(chalk.bgRed('ERROR:'), chalk.red(`directory ${outputDir} already exists and is not empty.`));
            gen.end();
          }
        } else {
          fs.mkdir(outputDir, () => {
            console.log(chalk.bgYellow('CREATED DIR:'), chalk.yellow(outputDir));
            gen.chdir(outputDir);
            (externalPrompts) ? gen.prompt(externalPrompts, done) : done();
          })
        }
      });
    })
    .on('postcopy', () => {
      const done = gen.async();

      // rename files
      const folder = gen.config.get('folder');
      const component = gen.config.get('component');
      gen.prompt({
        type: 'confirm',
        name: 'shouldRename',
        message: `Would you prefer ${folder}/${component}.js over ${folder}/index.js?`,
        default: false
      }, () => {
        if (gen.config.get('shouldRename')) {
          fs.renameSync(`${outputDir}/index.js`, `${outputDir}/${component}.js`);
        }
        done();
      });
    })
    .on('postinstall', () => {
      open(outputDir);
    })
    .run();
};
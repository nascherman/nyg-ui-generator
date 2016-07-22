/*
 This generates only boilerplate UI files
 */

const nyg = require('nyg');
const chalk = require('chalk');
const open = require('opn');
const fs = require('fs');
const path = require('path');

module.exports = (externalPrompts) => {
  console.log(' ');
  console.log(chalk.bgYellow('CWD:'), chalk.yellow(process.cwd()));
  console.log(' ');

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

  var outputDir;

  // assign relative path to base
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
            console.log(' ');
            console.warn(chalk.bgRed('ERROR:'), chalk.red(`Directory ${outputDir} already exists and is not empty.`));
            console.log(' ');
            gen.end();
          } else {
            gen.chdir(outputDir);
            (externalPrompts) ? gen.prompt(externalPrompts, done) : done();
          }
        } else {
          fs.mkdir(outputDir, () => {
            console.log(' ');
            console.log(chalk.bgYellow('CREATED DIRECTORY:'), chalk.yellow(outputDir));
            console.log(' ');
            gen.chdir(outputDir);
            (externalPrompts) ? gen.prompt(externalPrompts, done) : done();
          })
        }
      });
    })
    .on('postcopy', () => {
      gen.end();

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
        console.log(' ');
        console.log(chalk.bgYellow('DONE:'), chalk.yellow('Files have been successfully generated.'));
        console.log(' ');
        open(outputDir);
      });
    })
    .run();
};
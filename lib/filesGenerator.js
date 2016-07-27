/*
 This script generates only boilerplate UI files such as styles, js, templates etc
 No dependencies will be installed.
 */

const nyg = require('nyg');
const chalk = require('chalk');
const open = require('opn');
const fs = require('fs.extra');
const path = require('path');

module.exports = (externalPrompts, externalConfigs) => {
  console.log(chalk.bgYellow('CWD:'), chalk.yellow(process.cwd()));

  const prompts = [
    {
      'name': 'location',
      'message': 'Where would you like to create your component?',
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
          var length = 0;
          contents.forEach((item) => {
            (item.indexOf('.') !== 0 && item.indexOf('nyg-cfg') === -1) && length++;
          });

          if (length) {
            console.warn(chalk.bgRed('ERROR:'), chalk.red(`Directory ${outputDir} already exists and is not empty.`));
            gen.end();
          } else {
            gen.chdir(outputDir);
            (externalPrompts) ? gen.prompt(externalPrompts, done) : done();
          }
        } else {
          fs.mkdirp(outputDir, () => {
            console.log(chalk.bgYellow('CREATED DIRECTORY:'), chalk.yellow(outputDir));
            gen.chdir(outputDir);
            (externalPrompts) ? gen.prompt(externalPrompts, done) : done();
          })
        }
      });
    })
    .on('precopy', () => {
      const done = gen.async();
      const folder = gen.config.get('folder');
      const component = gen.config.get('component');

      gen.prompt({
        type: 'confirm',
        name: 'rename',
        message: `Would you prefer ${folder}/${component}.js over ${folder}/index.js?`,
        default: false
      }, (data) => {
        if (data.rename) {
          gen.config.set('rename', `${component}.js`);
        }
        done();
      });
    })
    .on('postcopy', () => {
      gen.end();

      if (gen.config.get('rename')) {
        const folder = gen.config.get('folder');
        const component = gen.config.get('component');
        fs.renameSync(`${outputDir}/index.js`, `${outputDir}/${component}.js`);
      }

      console.log(chalk.bgYellow('DONE:'), chalk.yellow('Files have been successfully generated.'));
      open(outputDir);
      process.exit(0);
    })
    .run();
};
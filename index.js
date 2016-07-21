const fs = require('fs');
const path = require('path');
const spawn = require('npm-execspawn');
const mkdir = require('mkdir-p');
const open = require('opn');
const chalk = require('chalk');
const nyg = require('nyg');
const nygModuleGenerator = require('nyg-module-generator');

const promptAction = [
  {
    type: "list",
    message: "What would you like to do?",
    name: "action",
    choices: [
      {
        name: "Generate UI boilerplate files",
        value: "boilerplate",
        checked: true
      },
      {
        name: "Create UI module",
        value: "module"
      },
      {
        name: "Publish existing component as module",
        value: "postpublish"
      }
    ]
  }
];

const promptName = [
  {
    type: "input",
    name: "component",
    message: "Component name:",
    default: "MyComponent"
  }
];

const promptType = [
  {
    type: "list",
    message: "Choose UI type:",
    name: "type",
    choices: [
      {
        name: "React",
        value: "react",
        checked: true
      },
      {
        name: "React-F1",
        value: "react-f1"
      },
      {
        name: "Bigwheel",
        value: "bigwheel"
      }
    ]
  }
];

const promptLocation = [
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

const prompts = promptName.concat(promptType);
const promptsPostPublish = promptType;

const globs = [
  {base: path.join(__dirname, 'templates/{{type}}'), output: '/'},
];

const globsBoilerplate = [
  {base: path.join(__dirname, 'templates/{{type}}/'), glob: '*.js', output: '/'},
  {base: path.join(__dirname, 'templates/{{type}}/'), glob: '*.scss', output: '/'},
  {base: path.join(__dirname, 'templates/{{type}}/'), glob: '*.less', output: '/'},
  {base: path.join(__dirname, 'templates/{{type}}/'), glob: '*.hbs', output: '/'}
];

const globsPostPublish = [
  {base: path.join(__dirname, 'templates/{{type}}/example'), glob: '*', output: '/example'},
  {base: path.join(__dirname, 'templates/{{type}}/test'), glob: '*', output: '/test'},
  {base: path.join(__dirname, 'templates/{{type}}/'), glob: 'package.json', output: '/'},
];

const callback = (cwd = globs.output) => {
  //run example
  var cmd = 'npm start';
  spawn(cmd, {cwd});
};

const gen = nyg(promptAction, [])
  .on('postprompt', () => {
    const action = gen.config.get('action');
    const isBoilerplate = (action === 'boilerplate');
    const isModule = (action === 'module');
    const isPostPublish = (action === 'postpublish');
    const opts = {prompts, globs, isPostPublish, promptsPostPublish, globsPostPublish, callback};

    if (isModule || isPostPublish) {
      nygModuleGenerator({prompts, globs, callback, isPostPublish});
    } else if (isBoilerplate) {
      console.log('your cwd:', process.cwd());
      var outputDir;

      // copy only UI boilerplate files
      const _prompts = promptLocation.concat(prompts);
      globsBoilerplate.forEach((g) => g.base = path.relative(__dirname, g.base));

      const _gen = nyg(_prompts, globsBoilerplate);

      _gen.on('postprompt', () => {
        outputDir = path.join(gen.config.get('location'), gen.config.get('folder'));
        console.log('component dir:', outputDir);

        _gen.chdir(outputDir);

        // check if directory exists
        try {
          fs.accessSync(outputDir);
          const contents = fs.readdirSync(outputDir);
          contents.forEach((item, index) => {
            (item.indexOf('.') === 0) && contents.splice(index, 1);
          });

          if (contents.length) {
            console.warn(chalk.bgYellow('WARN'), chalk.magenta(`directory ${outputDir} already exists and is not empty.`));
            _gen.end();
          }
        } catch (e) {
          mkdir.sync(outputDir);
        }
      });
      _gen.on('postcopy', () => {
        const done = _gen.async();

        // rename files
        const folder = gen.config.get('folder');
        const component = gen.config.get('component');
        _gen.prompt({
          type: 'confirm',
          name: 'rename',
          message: `Would you prefer ${folder}/${component}.js over ${folder}/index.js?`,
          default: false
        }, () => {
          if (_gen.config.get('rename')) {
            fs.renameSync(`${outputDir}/index.js`, `${outputDir}/${component}.js`);
          }
          done();
        });
      });
      _gen.on('postinstall', () => {
        // clean up
        let cmd = 'rm -r nyg-cfg.json';
        spawn(cmd, {cwd: globs.output});
        spawn(cmd, {cwd: outputDir});

        open(outputDir);
      });
      _gen.run();
    }

  })
  .run();
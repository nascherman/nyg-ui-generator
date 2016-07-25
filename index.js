const fs = require('fs');
const path = require('path');
const spawn = require('npm-execspawn');
const chalk = require('chalk');
const nyg = require('nyg');
const moduleGenerator = require('nyg-module-generator');
const filesGenerator = require('./lib/filesGenerator');
const Promise = require('bluebird');

const promptAction = [
  {
    type: "list",
    message: "What would you like to do?",
    name: "action",
    choices: [
      {
        name: "Generate UI component files",
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
      },
      {
        name: "exit ->",
        value: "exit"
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
    message: "Select UI type:",
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

const prompts = promptName.concat(promptType);

const globs = [
  {base: path.join(__dirname, 'templates/{{type}}'), output: '/'},
];

const globsPostPublish = [
  {base: path.join(__dirname, 'templates/{{type}}/example'), glob: '*', output: '/example'},
  {base: path.join(__dirname, 'templates/{{type}}/'), glob: 'package.json', output: '/'},
  {base: path.join(__dirname, 'templates/{{type}}/'), glob: '.*', output: '/'},
];

var configs = {};
var done;

const gen = nyg(promptAction, [])
  .on('postprompt', () => {
    const action = gen.config.get('action');

    switch (action) {
      case 'module':
        const callback = runExample;
        moduleGenerator({prompts, globs, callback});
        break;
      case 'boilerplate':
        filesGenerator(prompts, gen.config);
        break;
      case 'postpublish':
        done = gen.async();
        readConfigs(done);
        break;
      case 'exit':
        gen.end();
        break;
    }
  })
  .run();

function readConfigs() {
  // check for existing config file
  fs.readFile('nyg-cfg.json', 'utf8', (err, data) => {
    if (err) {
      console.warn(chalk.bgMagenta('WARN:'), chalk.magenta(`Could not open nyg-cfg.json from ${process.cwd()}.`));
    } else {
      configs = JSON.parse(data);

      checkIndexFile().then(() => {
        checkType();
      });
    }
  });
}

function checkType() {
  let prompts = [];
  let globs = globsPostPublish;
  const isPostPublish = true;
  const callback = runExample;
  const type = configs.type;
  const opts = {prompts, globs, isPostPublish, type, callback};

  if (!configs.type) {
    console.warn(chalk.bgMagenta('WARN:'), chalk.magenta(`Cannot get 'type' from ${process.cwd()}/nyg-cfg.json.`));
    gen.prompt(promptType, (data) => {
      gen.config._data = Object.assign({}, configs, gen.config._data, data.type);
      done();
      opts.type = data.type;
      moduleGenerator(opts);
    });
  } else {
    gen.config._data = Object.assign({}, configs, gen.config._data);
    done();
    moduleGenerator(opts);
  }
}

function checkIndexFile() {
  return new Promise((resolve, reject) => {
    try {
      fs.statSync('index.js');
      resolve();
    } catch (e) {
      if (!configs.rename) {
        console.warn(chalk.bgMagenta('WARN:'), chalk.magenta(`Cannot find index.js as well as 'rename' information from ${process.cwd()}/nyg-cfg.json.`));

        const choices = [];
        const re = /(\.(js)$)/i;

        fs.readdirSync(process.cwd())
          .filter((c) => re.test(c))
          .map((f) => {
            let option = {};
            option.name = f;
            option.value = f;
            choices.push(option)
          });

        gen.prompt({
          type: "list",
          message: "Select your component entry (index) file:",
          name: "rename",
          choices
        }, () => {
          gen.config._data = Object.assign({}, configs, gen.config._data);
          resolve();
        })
      } else {
        resolve();
      }
    }
  });
}

function runExample(cwd = globs.output) {
  const cmd = 'npm start';
  spawn(cmd, {cwd});
}
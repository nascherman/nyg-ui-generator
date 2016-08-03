const requireg = require('requireg');
const fs = require('fs.extra');
const path = require('path');
const spawn = require('npm-execspawn');
const chalk = require('chalk');
const nyg = require('nyg');
const moduleGenerator = requireg('nyg-module-generator'); // require global generator. local dep doesn't work properly
const detectIndexFile = require('./lib/detectIndexFile');
const filesGenerator = require('./lib/filesGenerator');
const detectDeps = require('./lib/detectDeps');

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

var globsPostPublish = [
  {base: path.join(__dirname, 'templates/{{type}}/example'), glob: '*', output: '/example'},
  {base: path.join(__dirname, 'templates/{{type}}/'), glob: 'package.json', output: '/'},
  {base: path.join(__dirname, 'templates/{{type}}/'), glob: '.*', output: '/'},
];

var configs = {};
var next;

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
        next = gen.async();
        readConfigs();
        break;
      case 'exit':
        gen.end();
        break;
    }
  })
  .run();

function readConfigs(configFile = 'nyg-cfg.json') {
  fs.readFile(configFile, 'utf8', (err, data) => {
    if (err) {
      console.warn(chalk.bgMagenta('WARN:'), chalk.magenta(`Could not open nyg-cfg.json from ${process.cwd()}.`));
    } else {
      if (!data) {
        fs.unlink(configFile);
      } else {
        configs = JSON.parse(data);
      }
    }

    detectIndexFile(gen, configs, mergeConfigs).then(() => {
      checkType(execPostPublish);
    });
  });
}

function checkType(cb) {
  let prompts = [];
  let globs = globsPostPublish;
  const isPostPublish = true;
  const callback = runExample;
  const type = configs.type;
  const rename = configs.rename;
  const opts = {prompts, globs, isPostPublish, type, callback, rename};

  if (!configs.type) {
    console.warn(chalk.bgMagenta('WARN:'), chalk.magenta(`Cannot get 'type' from ${process.cwd()}/nyg-cfg.json.`));
    gen.prompt(promptType, (data) => {
      opts.type = data.type;
      configs.type = data.type;
      cb && cb(opts);
    });
  } else {
    cb && cb(opts);
  }
}

function execPostPublish(opts) {
  mergeConfigs();
  next();
  //moduleGenerator(opts);

  detectDeps(configs, globsPostPublish, opts, () => moduleGenerator(opts));
}

function mergeConfigs() {
  const currConfigs = gen.config.getAll();
  gen.config.setAll(Object.assign({}, configs, currConfigs));
}

function runExample(cwd = globs.output) {
  const cmd = 'npm start';
  spawn(cmd, {cwd});
}
const fs = require('fs');
const path = require('path');
const spawn = require('npm-execspawn');
const chalk = require('chalk');
const nyg = require('nyg');
const moduleGenerator = require('nyg-module-generator');
const filesGenerator = require('./lib/filesGenerator');

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

const callback = (cwd = globs.output) => {
  // run example in the browser
  var cmd = 'npm start';
  spawn(cmd, {cwd});
};

const readConfigs = (gen) => {
  var configs = {};

  fs.readFile('nyg-cfg.json', 'utf8', (err, data) => {
    if (err) {
      console.warn(chalk.bgMagenta('WARN:'), chalk.magenta(`Could not open nyg-cfg.json from ${process.cwd()}.`));
    } else {
      configs = JSON.parse(data);
      if (!configs.type) {
        console.log(' ');
        console.warn(chalk.bgMagenta('WARN:'), chalk.magenta(`Cannot get 'type' from ${process.cwd()}/nyg-cfg.json, so you need to select it below.`));
        console.log(' ');
      }
    }

    const type = configs.type;
    const opts = {
      prompts: [],
      globs: globsPostPublish,
      isPostPublish: true,
      type
    };

    if (!type) {
      gen.prompt(promptType, (data) => {
        opts.type = data.type;
        moduleGenerator(opts);
      })
    } else {
      moduleGenerator(opts);
    }
  });
};

const gen = nyg(promptAction, [])
  .on('postprompt', () => {
    const action = gen.config.get('action');

    switch (action) {
      case 'module':
        moduleGenerator({prompts, globs, callback});
        break;
      case 'boilerplate':
        filesGenerator(prompts);
        break;
      case 'postpublish':
        const done = gen.async(); // important to prevent config file overwrite before reading
        readConfigs(gen);
        break;
    }
  })
  .run();
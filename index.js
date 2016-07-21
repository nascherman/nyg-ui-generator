const fs = require('fs');
const path = require('path');
const spawn = require('npm-execspawn');
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

const prompts = promptName.concat(promptType);
const promptsPostPublish = promptType;

const globs = [
  {base: path.join(__dirname, 'templates/{{type}}'), output: '/'},
];

const globsPostPublish = [
  {base: path.join(__dirname, 'templates/{{type}}/example'), glob: '*', output: '/example'},
  {base: path.join(__dirname, 'templates/{{type}}/test'), glob: '*', output: '/test'},
  {base: path.join(__dirname, 'templates/{{type}}/'), glob: 'package.json', output: '/'},
];

const callback = (cwd = globs.output) => {
  // run example in the browser
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
      moduleGenerator(opts);
    } else if (isBoilerplate) {
      filesGenerator(prompts);
    }
  })
  .run();
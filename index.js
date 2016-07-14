const fs = require('fs');
const nygModuleGenerator = require('nyg-module-generator');
const path = require('path');
const spawn = require('npm-execspawn');
const tape = require('tape');

const prompts = [
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
  },
  {
    type: "input",
    name: "component",
    message: "Name your component:",
    default: "NewComponent"
  }
];

const globs = [
  {base: path.join(__dirname, 'templates/{{type}}'), output: '/'},
];

const callback = (cwd = globs.output) => {
  //run example
  var cmd = 'npm start';
  spawn(cmd, {cwd});
};

nygModuleGenerator({prompts, globs, callback});
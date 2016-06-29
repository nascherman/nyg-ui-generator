const fs = require('fs');
const nyg = require('nyg');
const nygMg = require('nyg-module-generator');
const path = require('path');
const spawn = require('npm-execspawn');

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
  {base: path.join(__dirname, 'templates/tests/{{type}}'), output: '/'}
];

const callback = (cwd = globs.output) => {
  const cmd = `budo test.js --live  --open -- -t babelify -t brfs`;
  spawn(cmd, {cwd});
};

nygMg({prompts, globs, callback});
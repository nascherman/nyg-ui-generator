const fs = require('fs');
const execspawn = require('npm-execspawn');
const nyg = require('nyg');

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
    message: "How would you like to name your new component? (component)",
    default: "NewComponent"
  }
];

const globs = [
  {base: 'templates/{{type}}', output: '/'},
  {base: 'templates/tests/{{type}}', output: '/tests'}
];

const gen = nyg(prompts, globs)
  .on('postinstall', function () {
    const cmd = 'budo tests/test.js --live  --open -- -t babelify -t brfs';
    execspawn(cmd, {cwd: globs.output});
  })
  .run();
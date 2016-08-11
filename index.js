var Promise = require('bluebird');
var requireg = require('requireg');
var fs = require('fs.extra');
var path = require('path');
var spawn = require('npm-execspawn');
var chalk = require('chalk');
var nyg = require('nyg');
var moduleGenerator = require('nyg-module-generator'); // require global generator. local dep doesn't work properly on post publish
var detectIndexFile = require('./lib/detectIndexFile');
var filesGenerator = require('./lib/filesGenerator');
var detectImports = require('./lib/detectImports');
var rewriteImports = require('./lib/rewriteImportsPath');
var args = require('args');
args
  .option('type', 'The type of component to be made (react, react-f1, bigwheel)')
  .option('name', 'The name of the ui component')
  .option('folder', 'The name of the ui folder')
  .option('action', 'The desired action (module, boilerplate, postpublish)');

const flags = args.parse(process.argv);

validateFlags(flags);

var promptAction = [
  {
    type: "list",
    message: "What would you like to do?",
    name: "action",
    choices: [
      {
        name: "Generate boilerplate UI component",
        value: "boilerplate",
        checked: true
      },
      {
        name: "Publish existing component as module",
        value: "postpublish"
      },
      {
        name: "Create UI module",
        value: "module"
      },
      {
        name: "exit ->",
        value: "exit"
      }
    ]
  }
];

var promptName = [
  {
    type: "input",
    name: "component",
    message: "Component name:",
    default: "MyComponent"
  }
];

var promptType = [
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

var prompts = flags.name ? flags.type ? undefined : promptType : promptName.concat(promptType);
var globs = [
  {base: path.join(__dirname, 'templates/{{type}}'), output: '/'},
];

var globsPostPublish = [
  {base: path.join(__dirname, 'templates/{{type}}/example'), glob: '*', output: '/example'},
  {base: path.join(__dirname, 'templates/{{type}}/'), glob: 'package.json', output: '/'},
  {base: path.join(__dirname, 'templates/{{type}}/'), glob: '.*', output: '/'},
];

var configs = {};
var next;
if(!flags.action) {
  var gen = nyg(promptAction, [])
  .on('postprompt', function () {
    var action = gen.config.get('action');

    switch (action) {
      case 'module':
        moduleGenerator({prompts: prompts, globs: globs, callback: runExample});
        break;
      case 'boilerplate':
        filesGenerator(prompts, flags);
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
}
else {
  var action = flags.action;
  switch (action) {
    case 'module':
      moduleGenerator({prompts: prompts, globs: globs, callback: runExample});
      break;
    case 'boilerplate':
      filesGenerator(prompts, flags);
      break;
    case 'postpublish':
      next = gen.async();
      readConfigs();
      break;
    case 'exit':
      gen.end();
      break;
  }
}

function readConfigs(configFile) {
  configFile = configFile || 'nyg-cfg.json';

  fs.readFile(configFile, 'utf8', function (err, data) {
    if (err) {
      console.warn(chalk.bgMagenta('WARN:'), chalk.magenta('Could not open "nyg-cfg.json" from ' + process.cwd()));
    } else {
      if (!data) {
        fs.unlink(configFile);
      } else {
        configs = JSON.parse(data);
      }
    }

    detectIndexFile(gen, configs, mergeConfigs)
      .then(function () {
        checkType();
      });
  });
}

function checkType() {
  var opts = {
    prompts: [],
    globs: globsPostPublish,
    isPostPublish: true,
    type: configs.type,
    callback: runExample,
    rename: configs.rename,
    postCopyCallback: rewriteFiles
  };

  if (!configs.type) {
    console.warn(chalk.bgMagenta('WARN:'), chalk.magenta('Cannot get "type" from ' + process.cwd() + '/nyg-cfg.json'));
    gen.prompt(promptType, function (data) {
      opts.type = data.type;
      configs.type = data.type;
      execPostPublish(opts);
    });
  } else {
    execPostPublish(opts);
  }
}

function validateFlags(flags) {
  let type = flags.type;
  let action = flags.action;
  let name = flags.name;
  let folder = flags.folder;
  if(action) {
    if(action !== 'module' || action !==  'boilerplate' || action !==  'postpublish') {
      throw new Error('invalid action flag');
    }
  }
  if(type) {
    if(type !== 'react' || type !== 'react-f1' || type !== 'bighwheel') {
      throw new Error('invalid type');
    }
  }
  if(name) {
    //
  }
  if(folder) {
    // 
  }
}

function execPostPublish(opts) {
  mergeConfigs();
  next();
  detectImports(configs, globsPostPublish, opts, function () {
    moduleGenerator(opts);
  });
}

function mergeConfigs() {
  var currConfigs = gen.config.getAll();
  gen.config.setAll(Object.assign({}, configs, currConfigs));
}

function rewriteFiles(localImportsData, outputDir) {
  rewriteImports(localImportsData, outputDir);
}

function runExample(outputDir) {
  var cmd = 'npm start';
  spawn(cmd, {cwd: outputDir});
}
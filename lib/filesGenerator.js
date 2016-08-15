/*
 This script only generates boilerplate UI component files
 No dependencies will be installed.
 */

var nyg = require('nyg');
var chalk = require('chalk');
var open = require('opn');
var fs = require('fs.extra');
var path = require('path');

module.exports = function (externalPrompts, flags) {
  console.log(chalk.bgYellow('CWD:'), chalk.yellow(process.cwd()));
  var prompts;
  if(!flags.location) {
    prompts = [{
      'name': 'location',
      'message': 'Where would you like to create your component?',
      'default': process.cwd()
    }];
  }
  else {
    prompts = externalPrompts || [];
  }

  if(!flags.folder) {
    prompts.push({
      type: "input",
      name: "folder",
      message: "Component folder name:",
      default: "MyComponent"
    });
  }
  var globs = [
    {base: path.join(__dirname, 'templates/{{type}}/'), glob: '*.js', output: '/'},
    {base: path.join(__dirname, 'templates/{{type}}/'), glob: '*.scss', output: '/'},
    {base: path.join(__dirname, 'templates/{{type}}/'), glob: '*.less', output: '/'},
    {base: path.join(__dirname, 'templates/{{type}}/'), glob: '*.hbs', output: '/'}
  ];

  var outputDir;
  // assign relative path to base
  globs.forEach(function (g) {
    g.base = path.relative(__dirname, g.base);
  });

  var gen = nyg(prompts, globs)
    .on('postprompt', function () {
      if(flags.folder) {
        gen.config.set('folder', flags.folder);
      }
      if(flags.name) {
        gen.config.set('component', flags.name);
      }
      if(flags.location) {
        gen.config.set('location', flags.location);
      }
      if(flags.type) {
        gen.config.set('type', flags.type);
      }
      
      var done = gen.async();
      outputDir = path.join(gen.config.get('location'), gen.config.get('folder'));
      // check if directory exists
      fs.access(outputDir, function (err) {
        if (!err) {
          var contents = fs.readdirSync(outputDir);
          var length = 0;
          contents.forEach(function (item) {
            (item.indexOf('.') !== 0 && item.indexOf('nyg-cfg') === -1) && length++;
          });

          if (length) {
            console.warn(chalk.bgRed('ERROR:'), chalk.red('Directory ' + outputDir + ' already exists and is not empty.'));
            gen.end();
          } else {
            gen.chdir(outputDir);
            (externalPrompts) ? gen.prompt(externalPrompts, done) : done();
          }
        } else {
          fs.mkdirp(outputDir, function () {
            console.log(chalk.bgYellow('CREATED DIRECTORY:'), chalk.yellow(outputDir));
            gen.chdir(outputDir);
            (externalPrompts) ? gen.prompt(externalPrompts, done) : done();
          })
        }
      });
    })
    .on('precopy', function () {
      var done = gen.async();
      var folder = gen.config.get('folder');
      var component = gen.config.get('component');
      if(!flags.location) {
        gen.prompt({
          type: 'confirm',
          name: 'rename',
          message: 'Would you prefer ' + folder + '/' + component + '.js over ' + folder + '/index.js?',
          default: false
        }, function (data) {
          if (data.rename) {
            gen.config.set('rename', component + '.js');
          }
          done();
        });  
      }
      else {
        if(gen.config.get('rename')) {
          gen.config.set('rename', component + '.js');
        }
        done();
      }
      
    })
    .on('postcopy', function () {
      gen.end();

      if (gen.config.get('rename')) {
        var folder = gen.config.get('folder');
        var component = gen.config.get('component');
        fs.renameSync(outputDir + '/index.js', outputDir + '/' + component + '.js');
      }

      console.log(chalk.bgYellow('DONE:'), chalk.yellow('Files have been successfully generated.'));
      open(outputDir);
      process.exit(0);
    })
    .run();
};
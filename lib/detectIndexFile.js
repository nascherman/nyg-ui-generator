/*
 This script will detect index file or ask user to choose
 */

var Promise = require('bluebird');
var fs = require('fs.extra');
var chalk = require('chalk');

module.exports = function (gen, configs, cb) {
  var indexFile = configs.rename || 'index.js';

  return new Promise(function (resolve, reject) {
    try {
      fs.statSync(indexFile);
      configs.rename = indexFile;
      resolve();
    } catch (e) {
      if (!configs.rename || configs.rename === indexFile) {
        var choices = [];
        var re = /(\.(js|jsx)$)/i;

        fs.readdirSync(process.cwd())
          .filter(function (c) {
            return re.test(c)
          })
          .map(function (f) {
            choices.push({name: f, value: f});
          });

        if (choices.length > 1) {
          console.warn(chalk.bgMagenta('WARN:'), chalk.magenta('Cannot find "index.js" as well as "rename" information from ' + process.cwd() + '/nyg-cfg.json'));

          gen.prompt({
            type: "list",
            message: "Select your component entry (index) file:",
            name: "rename",
            choices
          }, function (data) {
            configs.rename = data.rename;
            cb && cb();
            resolve();
          })
        } else {

          if (!choices[0]) {
            console.warn(chalk.bgMagenta('WARN:'), chalk.magenta('There are no JS files in the current working directory'));
            gen.end();
            return;
          }

          configs.rename = choices[0].name;
          cb && cb();
          resolve();
        }
      } else {
        resolve();
      }
    }
  });
};
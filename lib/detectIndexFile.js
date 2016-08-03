/*
 This script will detect index file or ask user to choose
 */

const fs = require('fs.extra');
const chalk = require('chalk');

module.exports = (gen, configs, cb) => {
  const indexFile = configs.rename || 'index.js';

  return new Promise((resolve, reject) => {
    try {
      fs.statSync(indexFile);
      configs.rename = indexFile;
      resolve();
    } catch (e) {
      if (!configs.rename || configs.rename === indexFile) {
        const choices = [];
        const re = /(\.(js|jsx)$)/i;

        fs.readdirSync(process.cwd())
          .filter((c) => re.test(c))
          .map((f) => {
            choices.push({name: f, value: f});
          });

        if (choices.length > 1) {
          console.warn(chalk.bgMagenta('WARN:'), chalk.magenta(`Cannot find index.js as well as 'rename' information from ${process.cwd()}/nyg-cfg.json.`));

          gen.prompt({
            type: "list",
            message: "Select your component entry (index) file:",
            name: "rename",
            choices
          }, (data) => {
            configs.rename = data.rename;
            cb && cb();
            resolve();
          })
        } else {
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
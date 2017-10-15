const path = require("path");
const fs = require("fs");
const logger = require("../logger");
const src = path.join(process.cwd(), ".lempit");
const inquirer = require("inquirer");
const _ = require("lodash");
const files = [];
const dirs = [];
const generate = require("../generate").new;

module.exports = function(opt) {
  if (!fs.existsSync(src)) {
    logger.warning("'.lempit' directory is not found. Make sure you execute this command under root directory.");
    return;
  }

  walk(src, function(error) {
    if (error) {
      logger.error(error);
    }

    if (opt.dir) askDir();
    else askFile();
  });
};

function askDir() {
  const prompts = [
    {
      type: "list",
      name: "dir",
      message: "Select directory to generate",
      choices: dirs
    },
    {
      name: "path",
      message: "Target directory (leave it blank to generate in root directory)"
    }
  ];

  inquirer.prompt(prompts).then(answers => {
    console.log(" ");
    generate({
      template: answers.dir,
      dest: path.resolve(answers.path || "."),
      destName: answers.path
    });
  });
}

function askFile() {
  const prompts = [
    {
      type: "list",
      name: "file",
      message: "Select file to generate",
      choices: files
    },
    {
      type: "confirm",
      name: "rename",
      message: "Target to new file?"
    }
  ];

  inquirer.prompt(prompts).then(answers => {
    askNewFileName(answers.rename).then(answers2 => {
      answers = _.merge(answers, answers2);
      console.log(" ");
      generate({
        template: answers.file,
        rename: answers.rename,
        dest: path.resolve(answers.path || "."),
        destName: answers.path
      });
    });
  });
}

function askNewFileName(rename) {
  const prompts = [
    {
      name: "path",
      message: rename ? "New path and file name" : "Target directory (leave it blank to generate in root directory)",
      validate: function(input) {
        done = this.async();
        if (_.isEmpty(input) && rename) {
          done("New path and file name is required.");
          return;
        }

        done(null, true);
      }
    }
  ];

  return inquirer.prompt(prompts);
}

// ref: https://gist.github.com/adamwdraper/4212319
function walk(dir, done) {
  fs.readdir(dir, function(error, list) {
    if (error) {
      return done(error);
    }

    let i = 0;

    (function next() {
      let file = list[i++];

      if (!file) {
        return done(null);
      }

      file = path.join(dir, file);

      fs.stat(file, function(error, stat) {
        if (stat && stat.isDirectory()) {
          // found dir
          dirs.push(path.relative(src, file));
          walk(file, function(error) {
            if (error) {
              return done(error);
            }
            next();
          });
        } else {
          // found file
          const fName = path.relative(src, file);
          if (fName !== "meta.json" && fName !== "meta.js") files.push(fName);
          next();
        }
      });
    })();
  });
}

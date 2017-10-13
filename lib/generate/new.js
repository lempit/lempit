const fs = require("fs");
const home = require("user-home");
const path = require("path");
const program = require("commander");
const utils = require("../utils");
const logger = require("../logger");
const generate = require("./generate");
const rm = require("rimraf").sync;

module.exports = function(opt) {
  opt.template = program.args[0];

  // never clean destination
  opt.clean = false;
  opt.srcBasePath = path.join(process.cwd(), ".lempit");

  utils.resolveLocalTemplateSource(process.cwd(), path.join(".lempit", opt.template), function(src) {
    logger.log('Generating "%s" into "%s" directory.', src, opt.dest);

    opt.isFile = fs.lstatSync(src).isFile();
    if (opt.isFile) {
      // copy target file to temporary directory
      const homeLempitDir = path.join(home, ".lempit-templates");
      if (!fs.existsSync(homeLempitDir)) fs.mkdirSync(homeLempitDir);
      const tmp = path.join(homeLempitDir, "__local__gen__");
      if (fs.existsSync(tmp)) rm(tmp);
      fs.mkdirSync(tmp);
      fs
        .createReadStream(src)
        .once("error", err => {
          logger.fatal("Failed to copy file to temporary folder.", err);
        })
        .pipe(fs.createWriteStream(path.join(tmp, path.basename(src))));

      // use it as source template
      src = tmp;
    } else {
      if (opt.rename) logger.fatal('Option "-r" or "--rename" can only be use to generate single file.');
    }

    opt.src = src;
    generate(opt);
  });
};
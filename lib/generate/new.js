const fs = require("fs");
const home = require("user-home");
const path = require("path");
const chalk = require("chalk");
const utils = require("../utils");
const logger = require("../logger");
const generate = require("./generate");
const rm = require("rimraf").sync;

module.exports = function(opt) {
  // never clean destination
  opt.clean = false;
  opt.srcBasePath = path.join(process.cwd(), ".lempit");

  utils.resolveLocalTemplateSource(process.cwd(), path.join(".lempit", opt.template), function(src) {
    opt.isFile = fs.lstatSync(src).isFile();

    const rootDir = process.cwd();

    logger.log(
      'Generating "%s" into "%s" %s.',
      chalk.blue(path.relative(rootDir, src)),
      chalk.blue(path.relative(rootDir, opt.dest)),
      opt.isFile ? "file" : "directory"
    );

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

    opt.dest = resolveDest(opt);
    opt.src = src;

    generate(opt);
  });
};

/**
 * Resolve destination dir. If `maps` options is exists in `meta.(json|js)` then 
 * use the value as base dir of destination file(s) / folder.
 * 
 * @param {any} opt 
 * @returns 
 */
function resolveDest(opt) {
  const opts = utils.getMetadataOptions(opt.srcBasePath);
  if (opts.maps) {
    const rootDir = path.resolve(opt.srcBasePath, "../");
    for (let m in opts.maps) {
      if (opt.template.startsWith(m)) {
        return path.join(rootDir, opts.maps[m], opt.destName);
      }
    }
  }

  return opt.dest;
}

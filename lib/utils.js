const program = require("commander");
const path = require("path");
const download = require("download-git-repo");
const home = require("user-home");
const exists = require("fs").existsSync;
const rm = require("rimraf").sync;
const ora = require("ora");
const logger = require("./logger");
const metadata = require("read-metadata");

const utils = {
  /**
	 * Get current working directory from argument.
	 * @param {arg} Index of argument, default is 0.
	 */
  getWorkDir: function(arg) {
    const rawName = program.args[arg || 0];
    // const inPlace = !rawName || rawName === ".";
    // const name = inPlace ? path.relative("../", process.cwd()) : rawName;
    return path.resolve(rawName || ".");
  },

  resolveLocalTemplateSource: function(src, templateDir, done) {
    let p = path.isAbsolute(src) ? src : path.normalize(path.join(process.cwd(), src));

    // logger.fatal('>>', p, templateDir)
    if (!exists(p)) {
      logger.fatal('Can not find file or directory "' + src + '"');
      done(false);
    }

    if (templateDir) {
      p = path.join(p, templateDir);
      if (!exists(p)) {
        logger.fatal(
          'Template files must be exists under "' +
            templateDir +
            '" directory. Can not find "' +
            templateDir +
            '" directory under  "' +
            src +
            '".'
        );
        done(false);
      }
    }

    done(p);
  },

  /**
	 * Resolve source directory.
	 * @param {src} Source input.
	 * @param {done} Callback.
	 */
  resolveTemplateSource: function(src, done) {
    // is local?
    if (/^[./]|(^[a-zA-Z]:)/.test(src)) {
      // proccess local folder
      utils.resolveLocalTemplateSource(src, "template", done);
    } else {
      // proccess git repo

      const spinner = ora("downloading template " + src + "...").start();
      const tmp = path.join(home, ".lempit-templates", src.replace(/\//g, "-"));
      if (exists(tmp)) rm(tmp);

      download(src, tmp, { clone: false }, function(err) {
        spinner.stop();
        if (err) {
          logger.fatal("Failed to download repo " + src + ": " + err.message.trim());
          done(false);
        } else done(path.join(tmp, "template"));
      });
    }
  },

  isMustache(str) {
    return /{{([^{}]+)}}/g.test(str);
  },

  /**
 * Gets the metadata from either a meta.json or meta.js file.
 *
 * @param  {String} dir
 * @return {Object}
 */
  getMetadataOptions: function(dir) {
    const json = path.join(dir, "meta.json"),
      js = path.join(dir, "meta.js");
    let opts = {};

    if (exists(json)) {
      opts = metadata.sync(json);
    } else if (exists(js)) {
      const req = require(path.resolve(js));
      if (req !== Object(req)) {
        throw new Error("meta.js needs to expose an object");
      }
      opts = req;
    }

    return opts;
  }
};

module.exports = utils;

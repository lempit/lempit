const _ = require("lodash");
const parse = require("./parser");
const inquirer = require("inquirer");
const utils = require("./utils");
const path = require("path");
const metadata = require("read-metadata");
const exists = require("fs").existsSync;

/**
 * Collect variables from files and prompt it.
 * 
 * @param {src} Source directory.
 */
module.exports = function(dir) {
  const opts = getMetadataOptions(dir);
  let _prompts = opts.prompts || {};
  const optPrompts = function(key, prop, def) {
    let val = _prompts[key] ? _prompts[key][prop] : def;
    return _.isUndefined(val) ? def : val;
  };

  /**
   * Collect variables from files and prompt it.
   *
   * @param {any} files 
   * @param {any} metalsmith 
   * @param {any} done 
   */
  return function(files, metalsmith, done) {
    const keys = Object.keys(files),
      metadata = metalsmith.metadata();
    let prompts = [],
      params = {};

    // read variables from each file
    keys.forEach(function(file) {
      const str = files[file].contents.toString();

      // parse params for files that contains mustaches
      if (utils.isMustache(str)) {
        params = _.merge(params, parse(str, opts));
      }
    });

    // any raw helper?
    if (_.find(params, p => p.type === "raw-helper")) {
      metadata["raw-helper"] = true;
      delete params["raw-helper"];
    }

    // build prompt array
    prompts = _.map(params, (p, key) => {
      return _.merge(p, {
        name: key,
        message: optPrompts(key, "message", key) + ":",
        required: optPrompts(key, "required", false),
        validate: function(input) {
          const done = this.async();
          if (p.required && !input) return done("This field is required.");
          return done(null, true);
        }
      });
    });

    // ask user to fill variable values
    inquirer.prompt(prompts).then(function(answers) {
      for (let key in answers) {
        metadata[key] = answers[key];
      }
      done();
    });
  };
};

/**
 * Gets the metadata from either a meta.json or meta.js file.
 *
 * @param  {String} dir
 * @return {Object}
 */
function getMetadataOptions(dir) {
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

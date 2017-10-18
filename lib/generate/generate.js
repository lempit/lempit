const async = require("async");
const Metalsmith = require("metalsmith");
const renamer = require("metalsmith-renamer");
const render = require("consolidate").handlebars.render;
const ask = require("../ask");
const path = require("path");
const utils = require("../utils");
const logger = require("../logger");
const rm = require("rimraf").sync;

module.exports = function(opt) {
  /**
   * Build.
   */

  let dest = opt.dest,
    fileName = "";
  if (opt.rename) {
    fileName = path.basename(dest);
    dest = path.resolve(dest, "../");
  }

  const metalsmith = Metalsmith(__dirname)
    .use(ask(opt.srcBasePath))
    .use(template)
    .clean(opt.clean || false)
    .source(opt.src)
    .destination(dest);

  if (opt.rename) {
    metalsmith.use(
      renamer({
        filesToRename: {
          pattern: "*",
          rename: function() {
            return fileName;
          }
        }
      })
    );
  }

  metalsmith.build(function(err) {
    if (err) {
      logger.fatal(err);
    }

    if (opt.isFile) {
      rm(opt.src);
    }
    logger.success("Done.");
  });

  /**
   * Template in place.
   *
   * @param {Object} files
   * @param {Metalsmith} metalsmith
   * @param {Function} done
   */

  function template(files, metalsmith, done) {
    const keys = Object.keys(files);
    let metadata = metalsmith.metadata();

    metadata.$$dest = dest;

    async.each(keys, run, done);

    function run(file, done) {
      // logger.fatal(">>", files[file]);

      // file contents
      const str = files[file].contents.toString();

      // skip files that contains no mustaches
      if (!utils.isMustache(str)) {
        return done();
      }

      // render
      render(str, metadata, function(err, res) {
        if (err) {
          err.message = `[${file}] ${err.message}`;
          return done(err);
        }
        files[file].contents = new Buffer(res);
        done();
      });
    }
  }
};

var home = require("user-home");
var program = require("commander");
var async = require("async");
var Metalsmith = require("metalsmith");
var renamer = require('metalsmith-renamer');
var Handlebars = require("handlebars");
var render = require("consolidate").handlebars.render;
var path = require("path");
var utils = require("./utils");
var logger = require("./logger");
var ask = require("./ask");
var fs = require("fs");
var rm = require("rimraf").sync;

// register handlebars helper
Handlebars.registerHelper("if_eq", function(a, b, opts) {
  return a === b ? opts.fn(this) : opts.inverse(this);
});

Handlebars.registerHelper("unless_eq", function(a, b, opts) {
  return a === b ? opts.inverse(this) : opts.fn(this);
});

// init new project from template
exports.init = function(opt) {
  opt.template = program.args[0];
  logger.log('Generating "%s" into "%s" directory.', opt.template, opt.dest);
  utils.resolveTemplateSource(opt.template, function(src) {
    opt.srcBasePath = path.resolve(src, "../");
    opt.src = src;
    generate(opt);
  });
};

// generate file / folder based on template
exports.gen = function(opt) {
  opt.template = program.args[0];

  // never clean destination
  opt.clean = false;
  opt.srcBasePath = path.join(process.cwd(), ".lempit");

  utils.resolveLocalTemplateSource(process.cwd(), path.join(".lempit", opt.template), function(src) {
    logger.log('Generating "%s" into "%s" directory.', src, opt.dest);

    opt.isFile = fs.lstatSync(src).isFile();
    if (opt.isFile) {
      // copy target file to temporary directory
      var homeLempitDir = path.join(home, ".lempit-templates");
      if (!fs.existsSync(homeLempitDir))
        fs.mkdirSync(homeLempitDir);
      var tmp = path.join(homeLempitDir, "__local__gen__");
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
      if (opt.file) 
        logger.fatal('Option "-f" or "--file" can only be use to generate single file.');
    }

    opt.src = src;
    generate(opt);
  });
};

function generate(opt) {
  /**
   * Build.
   */

  var dest = opt.dest;
  var fileName = '';
  if (opt.file) {
    fileName = path.basename(dest);
    dest = path.resolve(dest, '../');    
  }

  var metalsmith = Metalsmith(__dirname)
    .use(ask(opt.srcBasePath))
    .use(template)
    .clean(opt.clean || false)
    .source(opt.src)
    .destination(dest);

  if (opt.file) {
    metalsmith.use(renamer({
      filesToRename: {
        pattern: '*',
        rename: function() {
          return fileName;
        }
      }
    }));
  }

  metalsmith
    .build(function(err) {
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
    var keys = Object.keys(files);
    var metadata = metalsmith.metadata();

    async.each(keys, run, done);

    function run(file, done) {
      // logger.fatal(">>", files[file]);

      // file contents
      var str = files[file].contents.toString();

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
}

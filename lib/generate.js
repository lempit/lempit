
var program = require('commander')
var async = require('async')
var Metalsmith = require('metalsmith')
var Handlebars = require('handlebars')
var render = require('consolidate').handlebars.render
var path = require('path')
var utils = require('./utils')
var logger = require('./logger')
var ask = require('./ask')



// register handlebars helper
Handlebars.registerHelper('if_eq', function (a, b, opts) {
  return a === b
    ? opts.fn(this)
    : opts.inverse(this)
})

Handlebars.registerHelper('unless_eq', function (a, b, opts) {
  return a === b
    ? opts.inverse(this)
    : opts.fn(this)
})



module.exports = function start(opt) {
  opt.template = program.args[0]
  logger.log('Generating "%s" into "%s" directory.', opt.template, opt.dest)
  utils.resolveTemplateSource(opt.template, function (src) {
    opt.src = src
    generate(opt)
  })
}



function generate(opt) {

  /**
   * Build.
   */


  var metalsmith = Metalsmith(__dirname)
    .use(ask(opt.src))
    .use(template)
    .clean(opt.clean || false)
    .source(opt.src)
    .destination(opt.dest)
    .build(function (err) {
      if (err) {
        logger.fatal(err)
      }

      logger.success('Done.')
    })



  /**
   * Template in place.
   *
   * @param {Object} files
   * @param {Metalsmith} metalsmith
   * @param {Function} done
   */

  function template(files, metalsmith, done) {
    var keys = Object.keys(files)
    var metadata = metalsmith.metadata()

    async.each(keys, run, done)

    function run(file, done) {

      // file contents
      var str = files[file].contents.toString()

      // skip files that contains no mustaches
      if (!utils.isMustache(str)) {
        return done()
      }

      // render
      render(str, metadata, function (err, res) {
        if (err) {
          err.message = `[${file}] ${err.message}`
          return done(err)
        }
        files[file].contents = new Buffer(res)
        done()
      })
    }
  }



};
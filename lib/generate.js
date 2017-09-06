
var program = require('commander')
var async = require('async')
var Metalsmith = require('metalsmith')
var inquirer = require('inquirer')
var render = require('consolidate').handlebars.render
var path = require('path')
var helper = require('./helper')
var logger = require('./logger')


module.exports = function start(opt) {
  opt.template = program.args[0]
  logger.log('Generating "%s" into "%s" directory.', opt.template, opt.dest)  
  helper.resolveTemplateSource(opt.template, function (src) {
    opt.src = src
    generate(opt)
  })
}


function generate(opt) {

  /**
   * Build.
   */


  var metalsmith = Metalsmith(__dirname)
    .use(ask)
    .use(template)
    .clean(opt.clean || false)
    .source(opt.src)
    .destination(opt.dest)
    .build(function (err) {
      if (err) {
        logger.fatal(err)
        return
      }

      logger.success('Done.')
    })


  /**
   * Collect variables from files and prompt it.
   * 
   * @param {any} files 
   * @param {any} metalsmith 
   * @param {any} done 
   */
  function ask(files, metalsmith, done) {
    var
      keys = Object.keys(files),
      prompts = [],
      metadata = metalsmith.metadata()

    // read variables from each file
    keys.forEach(function (file) {
      var str = files[file].contents.toString()
      var re = /{{([^{}]+)}}/g, m
      while (m = re.exec(str)) {
        var key = m[1]
        if (prompts.indexOf(key) === -1)
          prompts.push(key)
      }
    })

    // ask user to fill variable values
    inquirer.prompt(prompts.map(p => {
      return {
        type: String,
        name: p,
        message: p
      }
    })).then(function (answers) {
      for (var key in answers) {
        metadata[key] = answers[key]
      }
      done()
    })

  }


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
      var str = files[file].contents.toString()
      render(str, metadata, function (err, res) {
        if (err) return done(err)
        files[file].contents = new Buffer(res)
        done()
      })
    }
  }

};
var _ = require('lodash')
var parse = require('./parser')
var inquirer = require('inquirer')
var utils = require('./utils')
var path = require('path')
var metadata = require('read-metadata')
var exists = require('fs').existsSync



/**
 * Collect variables from files and prompt it.
 * 
 * @param {src} Source directory.
 */
module.exports = function (dir) {

	var opts = getMetadataOptions(path.resolve(dir, '../')),
		_prompts = opts.prompts || {},
		optPrompts = function (key, prop, def) {
			var val = _prompts[key] ? _prompts[key][prop] : def
			return _.isUndefined(val) ? def : val
		}


	/**
   * Collect variables from files and prompt it.
   * 
   * @param {any} files 
   * @param {any} metalsmith 
   * @param {any} done 
   */
	return function (files, metalsmith, done) {
		var
			keys = Object.keys(files),
			prompts = [],
			metadata = metalsmith.metadata(),
			params = {}


		// read variables from each file
		keys.forEach(function (file) {
			var str = files[file].contents.toString()

			// parse params for files that contains mustaches
			if (utils.isMustache(str)) {
				params = _.merge(params, parse(str, opts))
			}
		})


		// build prompt array
		prompts = _.map(params, (p, key) => {

			return _.merge(p, {
				name: key,
				message: optPrompts(key, 'message', key) + ':',
				required: optPrompts(key, 'required', false),
				validate: function (input) {
					var done = this.async()
					if (p.required && !input)
						return done('This field is required.')
					return done(null, true)
				}
			})
		})


		// ask user to fill variable values
		inquirer.prompt(prompts).then(function (answers) {
			for (var key in answers) {
				metadata[key] = answers[key]
			}
			done()
		})

	}

}


/**
 * Gets the metadata from either a meta.json or meta.js file.
 *
 * @param  {String} dir
 * @return {Object}
 */
function getMetadataOptions(dir) {
	var json = path.join(dir, 'meta.json')
	var js = path.join(dir, 'meta.js')
	var opts = {}

	if (exists(json)) {
		opts = metadata.sync(json)
	} else if (exists(js)) {
		var req = require(path.resolve(js))
		if (req !== Object(req)) {
			throw new Error('meta.js needs to expose an object')
		}
		opts = req
	}

	return opts
}
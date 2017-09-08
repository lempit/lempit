var program = require('commander')
var path = require('path')
var download = require('download-git-repo')
var home = require('user-home')
var exists = require('fs').existsSync
var rm = require('rimraf').sync
var ora = require('ora')
var logger = require('./logger')

module.exports = {

	/**
	 * Get current working directory from argument.
	 * @param {arg} Index of argument, default is 0.
	 */
	getWorkDir: function (arg) {
		var rawName = program.args[arg || 0]
		var inPlace = !rawName || rawName === '.'
		var name = inPlace ? path.relative('../', process.cwd()) : rawName
		return path.resolve(rawName || '.')
	},


	/**
	 * Resolve source directory.
	 * @param {src} Source input.
	 * @param {done} Callback.
	 */
	resolveTemplateSource: function (src, done) {

		// is local?
		if (/^[./]|(^[a-zA-Z]:)/.test(src)) {

			// proccess local folder

			var p = path.isAbsolute(src)
				? src
				: path.normalize(path.join(process.cwd(), src))

			if (!exists(p)) {
				logger.fatal('Can not find directory "' + src + '"')
				done(false)
			}

			p = path.join(p, 'template')
			if (!exists(p)) {
				logger.fatal('Template files must be exists under "template" directory. Can not find "template" directory under  "' + src + '".')
				done(false)
			}

			done(p)

		} else {

			// proccess git repo

			var spinner = ora('downloading template ' + src + '...').start()
			var tmp = path.join(home, '.lempit-templates', src.replace(/\//g, '-'))
			if (exists(tmp)) rm(tmp)

			download(src, tmp, { clone: false }, function (err) {
				spinner.stop()
				if (err) {
					logger.fatal('Failed to download repo ' + src + ': ' + err.message.trim())
					done(false)
				} else
					done(path.join(tmp, 'template'))
			})

		}

	},


	isMustache(str) {
		return /{{([^{}]+)}}/g.test(str)
	}

}
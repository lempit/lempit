var handlebars = require('handlebars')
var logger = require('./logger')


/**
* Parse the schema from a Handlebars `string`.
*
* @param {String} str
* @param {any} opts Metadata options
* @return {Schema}
*/

module.exports = function (str, opts) {
	var
		ast = handlebars.parse(str).statements,
		values = {},
		prompts = opts.prompts || {},
		blocks = ['if', 'if_eq', 'unless_eq', 'raw-helper']

	ast.forEach(function (obj) {

		switch (obj.type) {
			case 'mustache':
				if (obj.params.length) {
					obj.params.forEach(function (o) {
						if ('ID' == o.type) values[o.string] = { type: 'input' }
					})
				} else {
					var key = obj.sexpr.id.string
					values[key] = { type: 'input' }
				}
				break

			case 'block':
				var id = obj.mustache.sexpr.id.string, key = id
				if (values[id]) return

				if (id === 'raw-helper') {
					values[id] = { type: 'raw-helper' }
					return
				}

				var type = 'confirm'
				if (['if', 'if_eq', 'unless_eq'].indexOf(id) > -1) {
					key = obj.mustache.sexpr.params[0].string
					type = id == 'if' ? 'confirm' : 'list'
				}

				var prompt = prompts[key] || {}
				prompt.type = prompt.type || type
				if (prompt.type === 'list' && !prompt.choices) {
					logger.fatal('You need to set the "choices" of "' + key + '" in your metadata options file.')
				}

				values[key] = prompt
				break
		}

	})

	return values
}
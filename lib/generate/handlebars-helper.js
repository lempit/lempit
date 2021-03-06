const Handlebars = require("handlebars");
const _ = require("lodash");
const path = require("path");

//
// register handlebars helpers
//

//
// logics
//
Handlebars.registerHelper("if_eq", function(a, b, opts) {
  return a === b ? opts.fn(this) : opts.inverse(this);
});

Handlebars.registerHelper("unless_eq", function(a, b, opts) {
  return a === b ? opts.inverse(this) : opts.fn(this);
});

//
// strings
//
Handlebars.registerHelper("lowercase", function(str) {
  return _.lowerCase(str);
});

Handlebars.registerHelper("camelcase", function(str) {
  return _.camelCase(str);
});

Handlebars.registerHelper("uppercase", function(str) {
  return _.upperCase(str);
});

Handlebars.registerHelper("upperfirst", function(str) {
  return _.upperFirst(str);
});

Handlebars.registerHelper("startcase", function(str) {
  return _.startCase(str);
});

Handlebars.registerHelper("kebabcase", function(str) {
  return _.kebabCase(str);
});

Handlebars.registerHelper("snakecase", function(str) {
  return _.snakeCase(str);
});

//
// Paths
//
Handlebars.registerHelper("rela", function(str) {
  let result = path.relative(this.$$dest, path.join(process.cwd(), str));
  const info = path.parse(result);
  if (info.dir.indexOf(`..`) < 0) {
    result = `.` + path.sep + result;
  }
  return result.replace(/\\/g, "/");
});

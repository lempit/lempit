const path = require("path");
const utils = require("../utils");
const logger = require("../logger");
const generate = require("./generate");

module.exports = function(opt) {
  logger.log('Generating "%s" into "%s" directory.', opt.template, opt.dest);
  utils.resolveTemplateSource(opt.template, function(src) {
    opt.srcBasePath = path.resolve(src, "../");
    opt.src = src;
    generate(opt);
  });
};

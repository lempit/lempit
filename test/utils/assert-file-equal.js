var assert = require("assert");
var fs = require("fs");

module.exports = function(actual, expected) {
  var abuff = fs.readFileSync(actual);
  var ebuff = fs.readFileSync(expected);
  assert.equal(abuff.toString(), ebuff.toString());
};

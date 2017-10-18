const assert = require("assert");
const fs = require("fs");

module.exports = function(actual, expected) {
  const abuff = fs.readFileSync(actual);
  const ebuff = fs.readFileSync(expected);
  assert.equal(abuff.toString(), ebuff.toString());
};

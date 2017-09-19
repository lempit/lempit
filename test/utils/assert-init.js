var spawn = require("child_process").spawn;
var path = require("path");
var assertDir = require("assert-dir-equal");
var rm = require("rimraf").sync;
var lempit = require("./lempit");

const dest = path.resolve(__dirname, "tmp");

/**
 * Get test fixture.
 * 
 * @param {string} name 
 * @returns 
 */
function getFixture(name) {
  const src = path.resolve(__dirname, "../fixtures", "init", name);
  const answers = require(path.join(src, "answer.js"));
  return {
    src,
    answers,
    expected: path.join(src, "expected")
  };
}

/**
 * Get field name from stdin question data.
 * 
 * @param {string} str 
 * @returns 
 */
function findField(str) {
  const whiteList = ["*", "?"];
  var skip = true;
  whiteList.forEach(w => {
    if (str.startsWith(w)) skip = false;
  });

  if (skip) return "";

  var res = /.\s(\w+):/g.exec(str);
  if (res && res.length > 1) return res[1];
  throw "could not resolve field [" + str + "].";
}

/**
 * Assert lempit-init test.
 * 
 * @param {string} fixture fixture name
 * @param {Function} done callback
 */
module.exports = function(fixture, done) {
  var f = getFixture(fixture);
  var stderr = "";
  var child = lempit("init", [f.src, dest]);
  var answering = "";

  // capture output data
  child.stdout.on("data", function(data) {
    // get question
    var q = data.toString();
    var field = findField(q);
    if (field && answering !== field) {
      answering = field;
      setTimeout(function() {
        child.stdin.write(f.answers[field]);
        child.stdin.write("\n");
      }, 10);
    }
  });

  // capture error
  child.stderr.on("data", function(data) {
    stderr += data.toString();
  });

  // done
  child.on("close", function(code) {
    if (code === 1) done(new Error(stderr));
    assertDir(dest, f.expected);
    rm(dest);
    done();
  });
};

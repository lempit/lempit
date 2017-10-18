const path = require("path");
const assertDir = require("assert-dir-equal");
const rm = require("rimraf").sync;
const lempit = require("./lempit");

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
  let skip = true;
  whiteList.forEach(w => {
    if (str.startsWith(w)) skip = false;
  });

  if (skip) return "";

  const res = /.\s(\w+):/g.exec(str);
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
  const f = getFixture(fixture);
  const child = lempit("init", [f.src, dest]);
  let stderr = "";
  let answering = "";

  // capture output data
  child.stdout.on("data", function(data) {
    // get question
    const q = data.toString();
    const field = findField(q);
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

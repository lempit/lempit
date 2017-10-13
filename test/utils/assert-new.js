var spawn = require("child_process").spawn;
var path = require("path");
var assertDir = require("assert-dir-equal");
var assertFile = require("./assert-file-equal");
var rm = require("rimraf").sync;
var lempit = require("./lempit");
var fs = require("fs");

const dest = path.resolve(__dirname, "tmp");

/**
 * Get test fixture.
 * 
 * @param {string} name 
 * @returns 
 */
function getFixture(name) {
  const src = path.resolve(__dirname, "../fixtures", "new", name);
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
 * Assert lempit-new test.
 * 
 * @param {string} fixture fixture name
 * @param {Function} done callback
 */
module.exports = function(fixture, source, options, done) {
  var f = getFixture(fixture);
  var stderr = "";

  // change current directory to selected test fixture dir
  process.chdir(f.src);

  options = options || [];

  var result = path.join(dest, source);
  var toFile = options.indexOf("-f") > -1 || options.indexOf("--file") > 1;
  if (toFile) {
    result = path.join(dest, options[0]);    
  }

  var args = [source, dest];

  if (toFile) {
    args = [source, result, '-f'];
  }

  var child = lempit("new", args);
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

    const target = path.join(f.expected, source);
    if (fs.lstatSync(target).isFile()) {
      assertFile(result, target);
    } else {
      assertDir(dest, path.join(f.expected, source));
    }

    rm(dest);
    done();
  });
};

const path = require("path");
const assertDir = require("assert-dir-equal");
const assertFile = require("./assert-file-equal");
const lempit = require("./lempit");
const fs = require("fs");
const fse = require("fs-extra");
const dest = path.resolve(__dirname, "../_tmp");

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
 * Assert lempit-new test.
 * 
 * @param {string} fixture fixture name
 * @param {Function} done callback
 */
module.exports = function(fixture, source, options, done) {
  const f = getFixture(fixture);
  let stderr = "";

  // change current directory to selected test fixture dir
  process.chdir(f.src);

  options = options || [];

  // copy .lempit to /tmp/.lempit
  fse.copySync(path.join(f.src, ".lempit"), path.join(dest, ".lempit"));

  // should execute lempit under /tmp
  process.chdir(dest);

  let result = path.join(dest, source);
  const toFile = options.indexOf("-r") > -1 || options.indexOf("--rename") > 1;
  if (toFile) {
    result = path.join(dest, options[0]);
  }

  const args = [source];
  for (let o in options) {
    args.push(options[o]);
  }

  const child = lempit("new", args);
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
    if (code === 1)
      return clearTmp(function() {
        done(new Error(stderr));
      });

    try {
      const target = path.join(f.expected, source);
      if (fs.lstatSync(target).isFile()) {
        assertFile(result, target);
      } else {
        assertDir(dest, target);
      }

      clearTmp(done);
    } catch (error) {
      clearTmp(function() {
        done(new Error(error));
      });
    }
  });
};

function clearTmp(done) {
  setTimeout(function() {
    fse.emptyDirSync(dest);
    done();
  }, 100);
}

var assert = require("assert");
var utils = require("./utils");
var assertLempitInit = utils.assertLempitInit;
var assertLempitGen = utils.assertLempitGen;
var lempit = utils.lempit;

describe("#lempit cli tests", function() {
  describe("#common tests", function() {
    it("should show help without any args", function(done) {
      lempit("init", [], function(err, stdout, stderr) {
        assert(-stdout.indexOf("Usage: lempit-init <source> <project-name> [options]"));
        done(err);
      });
    });
  });

  describe("#simple init tests", function() {
    it("simple input", function(done) {
      assertLempitInit("simple", done);
    });
    it("boolean input", function(done) {
      assertLempitInit("bool", done);
    });
    it("select input", function(done) {
      assertLempitInit("select", done);
    });
  });

  describe("#simple gen tests", function() {
    // $ lempit gen component <dest>
    it("should generate all files in `component` to `<dest>` folder.", function(done) {
      assertLempitGen("simple", "component", null, done);
    });
    // $ lempit gen meh.js <dest>
    it("should generate meh.js file to `<dest>` folder.", function(done) {
      assertLempitGen("simple", "meh.js", null, done);
    });
    // $ lempit gen component <dest>
    it("should generate all files in `component` to `<dest>` folder with meta options.", function(done) {
      assertLempitGen("file-with-meta", "foo.js", null, done);
    });
    // lempit gen foo.js <dest>
    it("should generate foo.js file to `<dest>` folder with meta options.", function(done) {
      assertLempitGen("file-with-meta", "foo.js", null, done);
    });
    // lempit gen foo.js <dest>
    it("should generate foo.js file to `<dest>/penk.js` folder with meta options.", function(done) {
      assertLempitGen("file-with-meta", "foo.js", ["./penk.js", "-f"], done);
    });
  });
});

var assert = require("assert");
var utils = require("./utils");
var assertLempitInit = utils.assertLempitInit;
var assertLempitNew = utils.assertLempitNew;
var lempit = utils.lempit;

process.setMaxListeners(0);

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
    it("handlerbars strings", function(done) {
      assertLempitInit("handlebars-strings", done);
    });
    it("boolean input", function(done) {
      assertLempitInit("bool", done);
    });
    it("select input", function(done) {
      assertLempitInit("select", done);
    });
  });

  describe("#simple new tests", function() {
    // $ lempit new component <dest>
    it("should generate all files in `component` to `<dest>` folder.", function(done) {
      assertLempitNew("simple", "component", null, done);
    });
    // $ lempit new meh.js <dest>
    it("should generate meh.js file to `<dest>` folder.", function(done) {
      assertLempitNew("simple", "meh.js", null, done);
    });
    // $ lempit new component <dest>
    it("should generate all files in `component` to `<dest>` folder with meta options.", function(done) {
      assertLempitNew("file-with-meta", "foo.js", null, done);
    });
    // lempit new foo.js <dest>
    it("should generate foo.js file to `<dest>` folder with meta options.", function(done) {
      assertLempitNew("file-with-meta", "foo.js", null, done);
    });
    // lempit new foo.js <dest>/penk.js -r
    it("should generate foo.js file to `<dest>/penk.js` file (renamed) with meta options.", function(done) {
      assertLempitNew("file-with-meta", "foo.js", ["./penk.js", "-r"], done);
    });
    // lempit new actions/bar.js <dest>/penk.js -r
    it("should generate actions/bar.js file to `<dest>/the-actions/meh/bar.js` file with meta.maps options.", function(done) {
      assertLempitNew("directory-with-meta", "actions", ["foo"], done);
    });
  });
});

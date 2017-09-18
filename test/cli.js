var assert = require("assert");
var utils = require("./utils");
var assertLempitInit = utils.assertLempitInit;
var lempit = utils.lempit;

describe("#lempit cli tests", function() {
  
  describe("#common tests", function() {
    it("should show help without any args", function(done) {
      lempit("init", [], function(err, stdout, stderr) {
        assert(
          -stdout.indexOf(
            "Usage: lempit-init <source> <project-name> [options]"
          )
        );
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
});

var spawn = require("child_process").spawn;
var path = require("path");

/**
 * Spawn bin/lempit.
 * 
 * @param {string} cmd command
 * @param {string[]} args arguments
 * @returns 
 */
module.exports = function(cmd, args, callback) {
  var root = path.resolve(__dirname, "../../");
  var opts = { cwd: root, stdio: "pipe" };
  var _args = ["bin/lempit-" + cmd];

  // apply arguments
  args = args || [];
  args.forEach(a => {
    _args.push(a);
  });

  // spawning lempit-<cmd>.
  var child = spawn("node", _args, opts);

  process.on("exit", function() {
    child.kill();
  });

	// process callback if supplied
  if (callback) {
    var stdout = "",
      stderr = "";

    child.stdout.on("data", function(data) {
      stdout += data;
    });

    child.stderr.on("data", function(data) {
      stderr += data.toString();
    });

    child.on("close", function(code) {
      if (code === 1) callback(new Error(stderr));
      else callback(null, stdout, stderr);
    });
  }

  return child;
};

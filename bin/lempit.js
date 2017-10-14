#!/usr/bin/env node

var program = require("commander");

program
  .version(require("../package").version)
  .usage("<command> [options]")
  .command("init", "generate a new project from a template")
  .command("new", "generate a new file(s) from a template directory or file stored in `.lempit` directory.")
  .parse(process.argv);

// whitelisting args
if (["init", "new"].indexOf(program.args[0]) < 0) {
  return program.help();
}

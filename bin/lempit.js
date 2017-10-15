#!/usr/bin/env node

const chalk = require("chalk");
const program = require("commander");

program
  .version(require("../package").version)
  .usage("<command> [options]")
  .command("init", "generate a new project from a template")
  .command("new", "generate a new file(s) from a template directory or file stored in " + chalk.blue(".lempit") + " directory.")
  .command("list", "choose available templates in " + chalk.blue(".lempit") + " directory to generate some stuff.")
  .parse(process.argv);

// whitelisting args
if (["init", "new", "list"].indexOf(program.args[0]) < 0) {
  return program.help();
}

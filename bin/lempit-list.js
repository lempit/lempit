#!/usr/bin/env node

const program = require("commander");
const list = require("../lib/list");
const chalk = require("chalk");

program
  .usage("[options]")
  .option("-f, --file", "list available template files (default)")
  .option("-d, --dir", "list available template directories");

program.on("--help", function() {
  console.log("");
  console.log("  Choose available templates in " + chalk.blue(".lempit") + " directory to generate some stuff.");
  console.log("");
});

program.parse(process.argv);

list({ dir: program.dir });

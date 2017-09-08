#!/usr/bin/env node

var program = require('commander');
var generate = require('../lib/generate.js');
var utils = require('../lib/utils');
var path = require('path');
var chalk = require('chalk');

program
  .usage('<source> <project-name> [options]')
  .option('-c, --clean', 'clean target directory');

program.on('--help', function () {
  console.log('');
  console.log('  Examples:');
  console.log('');
  console.log(chalk.gray(`    # create new 'my-project' project`));
  console.log('    $ lempit init segmentio/khaos-node my-project');
  console.log('');
  console.log(chalk.gray(`    # clean 'my-project' directory, and create new 'my-project' project`));
  console.log('    $ lempit init segmentio/khaos-node my-project -c');
  console.log('');
});

program.parse(process.argv);

if (program.args.length < 2)
  return program.help();

let targetDir = utils.getWorkDir(1);

generate({
  dest: targetDir, 
  clean: program.clean
});

#!/usr/bin/env node

const program = require('commander');
const generate = require('../lib/generate').init;
const utils = require('../lib/utils');
const chalk = require('chalk');

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

const targetDir = utils.getWorkDir(1);

generate({
  template: program.args[0],
  dest: targetDir, 
  clean: program.clean
});

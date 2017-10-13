#!/usr/bin/env node

var program = require('commander');
var generate = require('../lib/generate.js').new;
var utils = require('../lib/utils');
var chalk = require('chalk');

program
  .usage('<directory or file in .lempit directory> <destination directory or file> [options]')
  .option('-f, --file', 'generate to file instead of directory (only works for source file only)');

program.on('--help', function () {
  console.log('');
  console.log('  Examples:');
  console.log('');
  console.log(chalk.gray(`    # generate new 'component/*' into './components/foo`));
  console.log('    $ lempit new component ./components/foo');
  console.log('');
  console.log(chalk.gray(`    # generate new 'modules/action.js' into './new-modules/action.js`));
  console.log('    $ lempit new modules/action.js ./new-modules');
  console.log('');
  console.log(chalk.gray(`    # generate new 'modules/action.js' into './modules/new-action.js`));
  console.log('    $ lempit new modules/action.js ./modules/new-action.js -f');
  console.log('');
  console.log('');
});

program.parse(process.argv);

if (program.args.length < 1)
  return program.help();

var targetDir = utils.getWorkDir(1);

generate({
  dest: targetDir, 
  file: program.file
});

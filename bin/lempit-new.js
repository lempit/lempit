#!/usr/bin/env node

const program = require('commander');
const generate = require('../lib/generate').new;
const utils = require('../lib/utils');
const chalk = require('chalk');

program
  .usage('<directory or file in .lempit directory> <destination directory or file> [options]')
  .option('-r, --rename', 'generate file with different name (only works for single file only)');

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
  console.log('    $ lempit new modules/action.js ./modules/new-action.js -r');
  console.log('');
  console.log('');
});

program.parse(process.argv);

if (program.args.length < 1)
  return program.help();

const targetDir = utils.getWorkDir(1);

generate({
  template: program.args[0],
  destName: program.args[1],
  dest: targetDir, 
  rename: program.rename
});

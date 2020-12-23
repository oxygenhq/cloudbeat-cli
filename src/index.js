#! /usr/bin/env node

import program from 'commander';
import colors from 'colors';
import runCmd from './cli-commands/run';
import runStatusCmd from './cli-commands/run-status';
import runResultCmd from './cli-commands/run-result';

let noCommandExecuted = true;

// general
program
.description('A CloudBeat CLI service')
.name('cloudbeat-cli')
.usage('<command> [options]')
.option('-foe, --failOnErrors <fail-on-errors>', 'controls whether to return non-successful exit code on errors or not')
.option('-dbg, --debug <debug>', 'print debug information during execution');
//.option('-f, --format <format>', 'test result format for run command. Default is `junit`.');

// run command
program
.command('run <testId> <testType> <apiKey> [host] [folder]', { isDefault: true })
.description('run specified test case or suite in CloudBeat')
.action((testId, testType, apiKey, host, folder) => {
    noCommandExecuted = false;

    runCmd(testId, testType, apiKey, {
        host,
        cwd: folder,
        format: program.format,
        folder: folder,
        failOnErrors: program.failOnErrors,
        debug: program.debug
    });
});

// run-status command
program
.command('run-status <runId> <apiKey> [host]', { isDefault: false })
.description('get specified run status')
.action((runId, apiKey, host = null) => {
    noCommandExecuted = false;

    runStatusCmd(runId, apiKey, { 
        host,
        failOnErrors: program.failOnErrors,
        debug: program.debug
    });
});

// run-result command
program
.command('run-result <runId> <apiKey> [host]', { isDefault: false })
.description('get test result for the specified test run')
.action((runId, apiKey, host = null) => {
    noCommandExecuted = false;
    runResultCmd(runId, apiKey, host, {
        failOnErrors: program.failOnErrors,
        debug: program.debug
    });
});

program.parse(process.argv);

if (noCommandExecuted) {
    program.outputHelp(makeRed);
}
  
function makeRed(txt) {
    return colors.red(txt); //display the help text in red on the console
}

process.on('unhandledRejection', error => {
    console.log('UnhandledRejection error: ', error.message);
});

process.on('uncaughtException', (err, origin) => {
    console.log('Caught exception: ', err);
    console.log('Exception origin: ', origin);
});

process.on('warning', (warning) => {
    console.warn(warning.name);
    console.warn(warning.message);
    console.warn(warning.stack);
});
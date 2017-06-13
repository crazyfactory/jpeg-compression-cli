#!/usr/bin/env node

const path = require('path');
const execFile = require('child_process').execFile;
const fs = require('fs-extra');
const guetzli = require('guetzli');
const program = require('commander');
const chalk = require('chalk');
const throat = require('throat');

const updateNotifier = require('update-notifier');
const pkg = require('../package.json');

const findImages = require('../src/internals').findImages;
const mapOutput = require('../src/internals').mapOutput;
const outputExists = require('../src/internals').outputExists;

// Notify for updates
if (pkg.version) {
    updateNotifier({pkg}).notify();
}

// Define commander
program
    .version(pkg.version || 'dev')
    .option('-r, --recursive', 'Walk given directory recursively')
    .option('-p, --path <path>', 'A path to crawl, defaults to current working directory')
    .option('-o, --output <path>', 'A target path to output the converted files, when using --files, provide multiple and separate by comma', v => v.split(','))
    .option('-q, --quality <value>', 'A quality value, by default 90', parseInt)
    .option('-c, --concurrency <number>', 'Parallel compression tasks, default 4', parseInt)
    .option('-f, --files <items>', 'the files you want to convert,split by \',\'', v => v.split(','))
    .option('-s, --skip', 'Will skip files if their output file already exists')
    .option('-v, --verbose', 'display additional information')
    .parse(process.argv);

// Running in Path or File Mode?
const pathMode = !program.files || !program.files.length;
if (!pathMode && program.output && program.output.length > 0 && program.output.length !== program.files.length) {
    console.log(chalk.red('expected 0 or ' + program.files.length + ' values for output-parameter, found ' + program.output.length));
    process.exit(1);
}

// Determine files
const files = program.files || findImages(process.path || process.cwd(), ['jpg'], program.recursive);
console.log(chalk.yellow('Found ' + files.length + ' image file(s)!'));

// Determine pathMode values
const basePath = pathMode && (process.path || process.cwd());
const outputPath = pathMode && ((program.output && program.output[0]) || basePath);

// Create Queue
const t = throat(program.concurrency || 4);

// Fill Queue
const quality = program.quality || 90;
let totalSize = 0;
let totalSaved = 0;
let totalSkipped = 0;
let alreadyCompressedCount = 0;
let compressedCount = 0;

const jobs = files.map((file, index) => file && t(() =>
    new Promise(resolve => {
        // Determine the output name
        const output = mapOutput(file, basePath, outputPath, program.output && program.output[index]);
        fs.ensureDirSync(path.dirname(output));

        // Skip?
        if (program.skip && outputExists(output)) {
            totalSkipped++;
            if (program.verbose) {
                console.log(chalk.gray(file + ' skipped.'));
            }
            resolve();
            return;
        }

        const size = fs.statSync(file).size;
        totalSize += size;
        const args = ['--quality', quality, file, output];

        if (program.verbose) {
            console.log(chalk.gray(file + ' is being compressed'));
        }
        execFile(guetzli, args, err => {
            if (err) {
                if (program.verbose) {
                    console.log(chalk.gray(err));
                }
                console.log(chalk.red(file + ' failed with error!'));
                resolve();
                return;
            }

            const newSize = fs.statSync(output).size;
            const percDiff = Math.round((1 - (newSize / size)) * 100);

            if (newSize < size) {
                compressedCount++;
                console.log(chalk.green(file + ' compressed by ' + (size - newSize) + ' bytes (' + percDiff + '%)'));
                totalSaved += size - newSize;
            } else {
                alreadyCompressedCount++;
                console.log(chalk.yellow(file + ' already compressed'));
            }

            resolve();
        });
    })
));

// Report
Promise.all(jobs).then(() => {
    if (program.verbose && totalSkipped > 0) {
        console.log(chalk.gray('Skipped ' + totalSkipped + ' file(s).'));
    }

    if (program.verbose && alreadyCompressedCount > 0) {
        console.log(chalk.gray('Found ' + alreadyCompressedCount + ' file(s) already compressed.'));
    }

    const failCount = files.length - compressedCount - totalSkipped - alreadyCompressedCount;
    if (failCount > 0) {
        console.log(chalk.red('Errors compressing ' + failCount + ' file(s).'));
    }

    const percDiff = Math.round((totalSaved / totalSize) * 100) || 0;
    console.log(chalk.yellow('Compressed ' + compressedCount + ' file(s), saving ' + totalSaved + ' bytes (' + percDiff + '%)'));
});

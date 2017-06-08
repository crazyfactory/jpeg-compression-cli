#!/usr/bin/env node

const fs = require('fs');
const execFile = require('child_process').execFile;
const guetzli = require('guetzli');
const program = require('commander');
const chalk = require('chalk');
const throat = require('throat');

const updateNotifier = require('update-notifier');
const pkg = require('../package.json');

const findImages = require('../src/find-images');

// Respect semantic-release
pkg.version = pkg.version || 'dev';
updateNotifier({pkg}).notify();

// Define commander
program
    .version(pkg.version)
    .option('-r, --recursive', 'Walk given directory recursively')
    .option('-p, --path <path>', 'A path to crawl, defaults to current working directory')
    .option('-q, --quality <value>', 'A quality value, by default 95')
    .option('-c, --concurrency <number>', 'Parallel compression tasks, default 4', parseInt)
    .option('-f, --files <items>', 'the files you want to convert,split by \',\'', v => v.split(','))
    .option('-v, --verbose', 'display additional information')
    .parse(process.argv);

// Determine files
const files = program.files
    ? program.files
    : findImages(process.path || process.cwd(), ['jpg'], program.recursive);
console.log(chalk.yellow('Found ' + files.length + ' image file(s)!'));

// Create Queue
const concurrency = program.concurrency || 4;
const t = throat(concurrency);

// Fill Queue
const quality = program.quality || 95;
let totalSize = 0;
let totalSaved = 0;
let compressedCount = 0;
const jobs = files.map(file => file && t(() =>
    new Promise(resolve => {
        const output = file;
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
                console.log(chalk.yellow(file + ' already compressed'));
            }

            resolve();
        });
    })
));

// Report
Promise.all(jobs).then(() => {
    const failCount = files.length - compressedCount;
    if (failCount > 0) {
        console.log(chalk.red('Could not process ' + failCount + ' file(s).'));
    }

    const percDiff = Math.round((totalSaved / totalSize) * 100);
    console.log(chalk.yellow('Compressed ' + compressedCount + ' file(s), saving ' + totalSaved + ' bytes (' + percDiff + '%)'));
});

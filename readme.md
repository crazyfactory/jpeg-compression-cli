# jpeg-compression-cli

[![npm](https://img.shields.io/npm/v/@crazyfactory/jpeg-compression-cli.svg)](http://www.npmjs.com/package/@crazyfactory/jpeg-compression-cli)
[![Build Status](https://travis-ci.org/crazyfactory/jpeg-compression-cli.svg?branch=master)](https://travis-ci.org/crazyfactory/jpeg-compression-cli)
[![dependencies Status](https://david-dm.org/crazyfactory/jpeg-compression-cli/status.svg)](https://david-dm.org/crazyfactory/jpeg-compression-cli)
[![devDependencies Status](https://david-dm.org/crazyfactory/jpeg-compression-cli/dev-status.svg)](https://david-dm.org/crazyfactory/jpeg-compression-cli?type=dev)
[![semantic-release](https://img.shields.io/badge/%20%20%F0%9F%93%A6%F0%9F%9A%80-semantic--release-e10079.svg)](https://github.com/semantic-release/semantic-release)
[![Greenkeeper badge](https://badges.greenkeeper.io/crazyfactory/jpeg-compression-cli.svg)](https://greenkeeper.io/)

Compresses JPG files using google's guetzli algorithm.

## Installation

    $ npm i -g @crazyfactory/jpeg-compression-cli

## Usage

jpeg-compression-cli allow you to convert your images within a current directory, recursively or not. It will overwrite your files with the compressed version 

After installation, just run command `jpgc` in ternimal.

To convert all images within the current directory and subdirectoies, use the -r flag

    $ jpgc -r

To choose a different folder provide it with -p flag

    $ jpgc -p /var/my-images

To convert the specific image files (assets/img.jpg in this example), you may run the following command.

    $ jpgc -f assets/img.jpg

or

    $ jpgc -f assets/img1.jpg,assets/img2.png

Change the parallel number of operations by using the -c flag

    $ jpgc -c 2

for more help infomation, you could run the -h flag to check it out.

    $ jpgc -h

## License

Copyright (c) 2017 Wolf T. Mathes for Crazy Factory Trading Co. Ltd.

Licensed under the MIT license.

See LICENSE for more info.

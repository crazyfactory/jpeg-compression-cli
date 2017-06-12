const fs = require('fs');
const readChunk = require('read-chunk');
const imageType = require('image-type');

function findImages(path, types, recursive) {
    const dirList = fs.readdirSync(path);
    let files = [];

    dirList.forEach(item => {
        if (fs.statSync(path + '/' + item).isFile()) {
            const imageTypeData = imageType(readChunk.sync(path + '/' + item, 0, 12));
            if (imageTypeData) {
                if (types.indexOf(imageTypeData.ext) !== -1) {
                    files.push(path + '/' + item);
                }
            }
        }
    });

    if (recursive) {
        dirList.forEach(item => {
            if (fs.statSync(path + '/' + item).isDirectory()) {
                files = files.concat(findImages(path + '/' + item, types, recursive));
            }
        });
    }

    return files;
}

function mapOutput(file, basePath, outputPath, output) {
    if (!file) {
        return null;
    }

    // # file mode
    if (!basePath) {
        return output || file;
    }

    // # path mode
    // Have basePath and outputPath? Combine!
    return outputPath && basePath !== outputPath
        ? outputPath + file.substring(basePath.length)
        : file;
}

function outputExists(file) {
    try {
        return fs.statSync(file).size > 0;
    } catch (err) {
        return err.code !== 'ENOENT';
    }
}

module.exports = {
    findImages,
    mapOutput,
    outputExists
};

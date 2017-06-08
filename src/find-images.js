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

module.exports = findImages;

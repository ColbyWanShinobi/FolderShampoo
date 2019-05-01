#!/usr/bin/env node
'use strict';

const fs = require('fs');
const is = require('image-size');
const path = require('path');
const mime = require('mime');
const untildify = require('untildify');
const util = require('util');
const readdir = util.promisify(fs.readdir);
const sizeOf = util.promisify(require('image-size'));

const sep = path.sep;
console.log('Found OS specific path seperator: ' + sep);
//console.log('Hello World');
//console.log(process.argv);
let inDir = '~/Dropbox';
let sourceDir = untildify(inDir);
console.log('Using Source Directory: ' + sourceDir)

let mimeMap = {
  'image/gif': {
    action: justMove,
    destination: untildify('~/Dropbox/Images/gifs')
  },
  'image/jpeg': {
    action: imageSort
  }
}

main();



/*getFileNames (sourceDir)
  .then( fileNames => {
    fileNames.forEach(fileName => {
      console.log(fileName);
      //getFileData(fileName)
      //  .then(imageDimCheck)
      //  .then(processFile);
    });
  })
  .then( data => {
    console.log('Done');
  });
*/

/**/

async function main() {
  try {
    let fileNames = await getFileNames(sourceDir);
    //console.log(fileNames)
    for (let fileName of fileNames) {
      console.log(fileName);
      let fileData = await getFileData(fileName);
      fileData = await imageDimCheck(fileData);
    }
  } catch (error) {
    console.log(error)
  }
}


async function getFileNames (sourceDir) {
  try {
    const fileNames = await readdir(sourceDir);
    console.log('Gathered a list of ' + fileNames.length + ' filenames');
    return fileNames;
  } catch (error) {
    throw error;
  }
}



async function getFileData (fileName) {
  try {
    console.log('Examining file: ' + fileName);
    let ext = path.extname(fileName);
    let fullName = sourceDir + sep + fileName;
    let dirName = path.dirname(fileName);
    let mimeType = mime.getType(fileName) || 'none';
    console.log(`MIMETYPE: ${mimeType}`)
    let fileType = mimeType.match(/^\w+/);
    console.log(`FILETYPE: ${fileType}`)

    let fileObj = {
      fullName: fullName,
      fileName: fileName,
      extension: ext,
      mimeType: mimeType,
      fileType: fileType[0]
    }

    return fileObj;
  } catch (error) {
    throw error;
  }
}

async function imageDimCheck (fileObj) {
  let newFileObj = fileObj;
  try {
    if (fileObj.fileType == 'image') {
      console.log('Getting image dimensions for: ' + fileObj.fullName);
      const dimensions = await sizeOf(fileObj.fullName);
      console.log(`Dimensions for image: ${fileObj.fullName}: ${dimensions.width} x ${dimensions.height}`)
      newFileObj.dimensions = dimensions;
    }
    return newFileObj;
  } catch (error) {
    console.log(error)
    return newFileObj  }
}

function processFile(fileObj) {
  return new Promise (function (resolve, reject) {
    console.log('processFile!');
    if (Object.keys(mimeMap).indexOf(fileObj.mimeType) == -1) {
      //console.log('Skipping unmapped MIME Type: ' + mimeType);
    } else {
      //console.log(mimeMap[fileObj.mimeType].action);
      //mimeMap[fileObj.mimeType].action(fileObj);
      console.log('boo');
      console.log(fileObj);
    }
    resolve(fileObj);
  });
}

function justMove (fileObj) {
  let newPath = mimeMap[fileObj.mimeType].destination + sep + fileObj.fileName;
  console.log('Just moving file from: ' + fileObj.fullName + ' to: ' + newPath);
  fs.rename(fileObj.fullName, newPath, (err) => {
    if (err) throw err;
    console.log('Move successful!');
  });

}

function imageSort (fileObj) {
  //console.log('Found image with dimensions: ' + fileObj.dimensions);
  //console.log(fileObj);
  //get file details
  //determine if the image is big enough to be a wallpaper or maybe 16:9 or 16:10
  //determine is an avatar
  //determine if it is a meme
}

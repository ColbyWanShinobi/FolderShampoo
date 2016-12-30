#! /usr/local/bin/node
'use strict';

const fs = require('fs');
const is = require('image-size');
const path = require('path');
const mime = require('mime');
const untildify = require('untildify');

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

getFileNames (sourceDir)
  .then( fileNames => {
    fileNames.forEach(fileName => {
      getFileData(fileName)
        .then(imageDimCheck)
        .then(processFile);
    });
  })
  .then( data => {
    console.log('Done');
  });


  /**/


function getFileNames (sourceDir) {
  return new Promise (function (resolve, reject) {
    fs.readdir(sourceDir, (err, fileNames) => {
      if (err) throw err;
      console.log('Gathered a list of ' + fileNames.length + ' filenames');
      resolve(fileNames);
    });
  });





}



function getFileData (fileName) {
  return new Promise (function (resolve, reject) {
    console.log('Examining file: ' + fileName);
    let ext = path.extname(fileName);
    let fullName = sourceDir + sep + fileName;
    let dirName = path.dirname(fileName);
    let mimeType = mime.lookup(fileName);
    let fileType = mimeType.match(/^\w+/);

    let fileObj = {
      fullName: fullName,
      fileName: fileName,
      extension: ext,
      mimeType: mimeType,
      fileType: fileType[0]
    }
    resolve(fileObj);
  });
}

function imageDimCheck (fileObj) {
  return new Promise (function (resolve, reject) {
    console.log('Getting image dimensions for: ' + fileObj.fullName);
    if (fileObj.fileType == 'image') {
      //console.log('A');
      is(fileObj.fullName, function (err, dimensions) {
        //if (err) {
          //console.log('Found unsupported image: ' + fileObj.fullName);
        //} //else {
          //console.log('B');
          fileObj.dimensions = dimensions;
          //console.log(fileObj);
          //console.log('2');
        //}
        return fileObj;
      })
      .then (fileObj => {
        console.log('BANANA!');
        resolve(fileObj);
      });
    }
    //resolve(fileObj);
  });
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

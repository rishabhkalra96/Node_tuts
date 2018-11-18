/*
Library to manage the logging tasks
*/

//Dependencies
const fs = require('fs');
const zlib = require('zlib');
const path = require('path');


//Container for logger module
var lib = {};

lib.baseDir = path.join(__dirname, '/../.logs/');


lib.list = (listZip,callback)=>{
    fs.readdir(lib.baseDir, (err, data)=>{
        if(!err && data.length > 0){
            let trimmedList = [];
            data.forEach((fileName)=>{
                if(fileName.indexOf('.log') > -1)
                trimmedList.push(fileName.replace('.log', ''));

                //add the zip files (.gz.64) to the list if listZip is true
                if(fileName.indexOf('.gz.64') > -1 && listZip)
                trimmedList.push(fileName.replace('.gz.64', ''));
            });
            //everything went ok
            callback(false, trimmedList);
        }
        else {
            callback(err,data)
        }
    });
};

//compress the contents from the source file to new destfile.gz.64
lib.compress = (logId, newFileId, callback)=>{
    let sourceFile = logId+'.log';
    let destFile = newFileId+'.gz.64';

    //read the source file, compress it and move it to dest file
    fs.readFile(lib.baseDir+sourceFile, 'utf8', (err, sourceData)=>{
        if (!err && sourceData){
            //compress the contents into the dest file
            zlib.gzip(sourceData, (err, buffer)=>{
                if (!err && buffer){
                    //open the dest file and write the compressed contents
                    fs.open(lib.baseDir+'.compressed/'+destFile, 'wx',(err, fileDescriptor)=>{
                        if(!err && fileDescriptor){
                            fs.writeFile(fileDescriptor, buffer.toString('base64'), (err)=>{
                                if (!err){
                                    //close the dest file
                                    fs.close(fileDescriptor, (err)=>{
                                        if (!err){
                                            //everything went ok, compression successfull
                                            console.log("compressed into ", destFile);
                                            callback(false)
                                        }
                                        else {
                                            callback(err);
                                        }
                                    });
                                }
                                else {
                                    callback(err);
                                }
                            });
                        }
                        else {
                            callback(err);
                        }
                    });
                }
                else {
                    callback(err);
                }
            });
        }
        else {
            callback(err);
        }
    });
};

//decompress the contents of .gz.64 file into a variable
lib.decompress = (fileId, callback)=>{
    let fileName = fileId + '.gz.64';
    //read the file
    fs.readFile(lib.baseDir+'.compressed/'+fileName, 'utf8', (err, data)=>{
        if(!err && data){
            //convert the contents of compressed file into a base64 buffer
            let inputBuffer = Buffer.from(data, 'base64');
            //feed this buffer to decompress method in zlib module
            zlib.unzip(inputBuffer, (err, decompressedData)=>{
                if (!err && decompressedData){
                    let outputData = decompressedData.toString();
                    //everything went fine, return the data with no error
                    callback(false, outputData);
                }
                else {
                    callback(err);
                }
            });        
        }
        else {
            callback(err)
        }
    });
};


lib.truncate = (logId, callback)=>{
    let fileName = logId+'.log';

    //simply truncate all the contents of the log file
    // 0 means truncate all the contents of the specified file
    fs.truncate(lib.baseDir+fileName, 0, (err)=>{
        if(!err){
            //everything went ok
            callback(false);
        }
        else {
            callback(err);
        }
    });
};


lib.append = (filename, dataString, callback)=>{
    //see if the file is already present, if not, create one
    fs.open(lib.baseDir+filename+'.log', 'a', (err, fileDescriptor)=>{
        if(!err && fileDescriptor){
            fs.appendFile(fileDescriptor, dataString+'\n', (err)=>{
                if (!err){
                    fs.close(fileDescriptor, (err)=>{
                        if (err){
                            callback('Error closing the log file')
                        }
                        else {
                            callback(false);
                        }
                    });
                }
                else {
                    callback('Error appending to log file');
                }
            });
        }
        else {
            callback('Could not open log file for appending', err);
        }
    });
};

//export the module
module.exports = lib; 
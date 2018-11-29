/*
*A library to store and retreive data
* 
*/

//dependency
//one for accessing the files and another to resolve absolute paths
var fs = require('fs');
var path = require('path');
var helpers = require('./helpers');


//container for the module to be exported
var lib = {};

//base directory path to access the data folder
lib.baseDir = path.join(__dirname, '/../.data/');

//create a write operation
lib.create = (dir, file, data, callback) => {
    //opening the file
    fs.open(lib.baseDir+dir+'/'+file+'.json', 'wx', (err, fileDescriptor)=>{
        if(!err && fileDescriptor){
            //convert data to string
            var stringData = JSON.stringify(data);
            //write data in string format in the specified file by using the unique fileDesctiptor
            fs.writeFile(fileDescriptor, stringData, (err)=>{
                if (!err){
                    //written successfully, now closing the file
                    fs.close(fileDescriptor, (err)=>{
                        if (!err){
                            /*
                            everything is good and the file has been closed successfully
                            now we can send false to callback which means we are sending 
                            callback(err) as false means no error occured
                            */
                            callback(false);
                        }
                        else {
                            callback("error closing the new file");
                        }
                    });
                }
                else {
                    callback("error writing to new file");
                }
            });
        }
        else {
            callback("Could not create a new file, maybe the file is already existing !!!");
        }
    });
};

lib.read = (dir, file, callback) => {
    fs.readFile(lib.baseDir+dir+'/'+file+'.json', 'utf8', (err, data)=>{
        if(!err && data){
            var parsedData = helpers.convertJSONstr2JSON(data);
            callback(false, parsedData);
        }
        else {
            callback(err, data);
        }
    });
};

lib.update = (dir, file, data, callback) => {
    //first open the file and then update it
    fs.open(lib.baseDir+dir+'/'+file+'.json', 'r+', (err, fileDescriptor)=>{
        if (!err && fileDescriptor){
            //truncate the file and then write on top of it
            fs.ftruncate(fileDescriptor, (err)=>{
                if(!err){
                    //write to file
                    var stringData = JSON.stringify(data);
                    fs.writeFile(fileDescriptor, stringData, (err)=>{
                        if(!err){
                            //successfully written, now close it
                            fs.close(fileDescriptor, (err)=>{
                                if(!err){
                                    //since everything happend correctly,we pass callback(false)
                                    //means no error occured
                                    callback(false);
                                }
                                else{
                                    callback("error while closing your file");
                                }
                            });
                        }
                        else {
                            callback("error while writing to your file");
                        }
                    });
                }
                else {
                    callback("error while truncating the file");
                }
            });     
        }
        else {
            callback("error occured while opening the file");
        }
    });
};

lib.delete = (dir, file, callback)=>{
    //simply delete the file 
    fs.unlink(lib.baseDir+dir+'/'+file+'.json', (err)=>{
        if(!err){
            callback(false);
        }
        else{
            callback("unable to delete the file, maybe it doesn't exist");
        }
    });
};

lib.list = (dir, callback)=>{
    //list the files
    fs.readdir(lib.baseDir+'/'+dir+'/', (err, directoryList)=>{
        if(!err && directoryList.length > 0){
            let trimmedFileNames = [];
            directoryList.forEach((fileName)=>{
                trimmedFileNames.push(fileName.replace('.json', ''));
            });
            callback(false, trimmedFileNames);
        }
        else {
            callback(err,directoryList);
        }
    });
};
//export the library object
module.exports = lib;
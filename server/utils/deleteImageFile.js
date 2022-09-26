const fs = require("fs");
const path = require("path");

const imageFolderPath = path.resolve(__dirname,"../assets/images")+"/";

function deleteImage(fileName){
    fs.unlink(imageFolderPath + fileName,(err)=>{
        if (err) throw err;
    });
};

module.exports = deleteImage;

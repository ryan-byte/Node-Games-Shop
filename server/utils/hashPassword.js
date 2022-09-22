const crypto = require("crypto");


function hashPassword(password,key){
    return crypto.pbkdf2Sync(password,key,1000,32,"sha512").toString("hex");
}

module.exports = hashPassword;
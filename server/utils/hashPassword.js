const crypto = require("crypto");

let digestAlgorithm = process.env.digestAlgorithm || "sha256";

function hashPassword(password,key){
    return crypto.pbkdf2Sync(password,key,1000,32,digestAlgorithm).toString("hex");
}

module.exports = hashPassword;
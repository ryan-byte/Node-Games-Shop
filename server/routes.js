const path = require("path");

function getHomepage(req,res){
    res.status(200).sendFile(path.join(__dirname + "/assets/html/index.html"));
}

module.exports = {getHomepage};
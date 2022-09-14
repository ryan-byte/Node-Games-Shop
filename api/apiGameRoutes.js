const database = require("../server/database/database");


async function api_getAllgames(req,res){
    let data = await database.getAllgames();
    res.status(200);
    res.json(data);
}
async function api_getGameByTitle(req,res){
    let title = req.params.title;
    let data = await database.getGamesByTitle(title);
    if (data.length === 0){
        res.sendStatus(404);
    }else{
        res.status(200).json(data);
    }
}

module.exports = {api_getAllgames,api_getGameByTitle}
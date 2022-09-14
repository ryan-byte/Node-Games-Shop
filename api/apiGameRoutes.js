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

async function api_addGame(req,res){
    let {title,price,stock,type} = req.query;
    price = parseInt(price);
    stock = parseInt(stock);
    const validate =    typeof title === "undefined" ||
                        typeof price === "undefined" ||
                        isNaN(price) ||
                        typeof stock === "undefined" ||
                        isNaN(stock) ||
                        typeof type === "undefined"
    if (validate) res.sendStatus(400);
    else{
        database.addNewGame(title,price,stock,type);
        res.sendStatus(201);
    }
}

module.exports = {api_getAllgames,api_getGameByTitle,api_addGame}
const database = require("../server/database/database");


async function api_getAllgames(req,res){
    let data = await database.getAllgames();
    if (data["error"]){
        res.sendStatus(502)
    }else{
        res.status(200);
        res.json(data);
    }
}
async function api_getGameByTitle(req,res){
    let title = req.params.title;
    let data = await database.getGamesByTitle(title);
    if (data["error"]){
        res.sendStatus(502)
    }
    else if (data.length === 0){
        res.sendStatus(204);
    }else{
        res.status(200).json(data);
    }
}

async function api_addGame(req,res){
    let {title,price,stock,type} = req.query;
    price = parseInt(price);
    stock = parseInt(stock);
    const invalid =    typeof title === "undefined" ||
                        typeof price === "undefined" ||
                        isNaN(price) ||
                        typeof stock === "undefined" ||
                        isNaN(stock) ||
                        typeof type === "undefined"||
                        title === ""||
                        type === ""||
                        price === ""||
                        stock === "";
    if (invalid) res.sendStatus(400);
    else{
        let data = await database.addNewGame(title,price,stock,type);
        if (data["error"]){
            res.sendStatus(502)
        }else{
            res.sendStatus(201);
        }
    }
}

async function api_removeGame(req,res){
    let id = req.params.id;
    let gameRemovedStatus = await database.removeGame(id);
    res.sendStatus(gameRemovedStatus);
}

async function api_updateGame(req,res){
    let id = req.params.id;
    let {title,price,stock,type} = req.query;
    price = parseInt(price);
    stock = parseInt(stock);
    const invalid =    typeof title === "undefined" ||
                        typeof price === "undefined" ||
                        isNaN(price) ||
                        typeof stock === "undefined" ||
                        isNaN(stock) ||
                        typeof type === "undefined"||
                        title === ""||
                        type === ""||
                        price === ""||
                        stock === "";
                        
    if (invalid) res.sendStatus(400);
    else{
        const updateGameStatus = await database.updateGame(id,title,price,stock,type);
        res.sendStatus(updateGameStatus);
    }

}

module.exports = {
                    api_getAllgames,
                    api_getGameByTitle,
                    api_addGame,
                    api_removeGame,
                    api_updateGame}
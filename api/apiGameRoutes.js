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
        //when there is no image uploaded make the imageName -> default.jpg
        if (res.locals.imageName === undefined){
            console.log("setting image to default");
            res.locals.imageName = "default.jpg";
        }
        let dataStatus = await database.addNewGame(title,price,stock,type,res.locals.imageName);
        if (dataStatus["error"]){
            res.sendStatus(502)
        }else{
            res.sendStatus(dataStatus);
            if (dataStatus === 201){
                //log the username action
                let username = res.locals.username;
                if (res.locals.imageName === "default.jpg"){
                    database.logUserAction(username,`Added ${title}(type: ${type} /price: ${price}/ stock: ${stock}) without an image`);
                }else{
                    database.logUserAction(username,`Added ${title}(type: ${type} /price: ${price}/ stock: ${stock})`);
                }
            }
        }
    }
}

async function api_removeGame(req,res){
    let id = req.params.id;
    let gameRemoved = await database.removeGame(id);
    let gameTitle = gameRemoved.title;
    let status = gameRemoved.status;
    if (status === 200){
        //log the username action
        let username = res.locals.username;
        database.logUserAction(username,`Deleted ${gameTitle} from the game list`);
    }
    res.sendStatus(status);
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
        //update data
        const updateGame = await database.updateGame(id,title,price,stock,type);
        let updateGameStatus = updateGame.status;
        let oldValues = updateGame.oldValues;
        //log the username action
        if (updateGameStatus === 200){
            let username = res.locals.username;
            database.logUserAction(username,`Updated old values(title: ${oldValues.title} /type: ${oldValues.type} /price: ${oldValues.price}/ stock: ${oldValues.stock}) new values (title: ${title} /type: ${type} /price: ${price}/ stock: ${stock})`);
        }
        //send the response
        res.sendStatus(updateGameStatus);
    }

}

module.exports = {
                    api_getAllgames,
                    api_getGameByTitle,
                    api_addGame,
                    api_removeGame,
                    api_updateGame}
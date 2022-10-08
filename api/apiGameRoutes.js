const database = require("../server/database/database");
const fireBaseStorage = require("../server/utils/firebaseStorage");

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
async function api_getMultipleGamesByID(req,res){
    try{
        let gamesIDs = req.params.ids;
        gamesIDs = JSON.parse(gamesIDs);
        let data = await database.getGamesByIDs(gamesIDs);
        if (data["error"]){
            res.sendStatus(502);
        }else{
            res.status(200);
            res.json(data);
        }
    }
    catch(err){
        if (err instanceof SyntaxError){
            res.sendStatus(400);
        }else{
            res.sendStatus(500);
        }
    }
}

async function api_addGame(req,res){
    //note: variables verification is done in a middleware
    //get required variables for the database query
    let {title,price,stock,type} = req.query;
    price = parseInt(price);
    stock = parseInt(stock);
    let imageName = res.locals.imageName;
    let imageURL = res.locals.imageURL;

    //add new game
    let dataStatus = await database.addNewGame(title,price,stock,type,imageURL,imageName);
    if (dataStatus["error"]){
        res.sendStatus(502)
    }else{
        res.sendStatus(dataStatus);
        if (dataStatus === 201){
            //log the username action
            let username = res.locals.username;
            if (res.locals.imageName === undefined){
                database.logUserAction(username,`Added ${title}(type: ${type} /price: ${price}/ stock: ${stock}) without an image`);
            }else{
                database.logUserAction(username,`Added ${title}(type: ${type} /price: ${price}/ stock: ${stock})`);
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
        //delete the image file
        if (gameRemoved.imageName){
            let output = await fireBaseStorage.deleteImage(gameRemoved.imageName);
            //error handling
            if (output["error"]){
                console.log("error while deleting an image from firebase");
            }
        }
        //log the username action
        let username = res.locals.username;
        database.logUserAction(username,`Deleted ${gameTitle} from the game list`);
    }
    res.sendStatus(status);
}

async function api_updateGame(req,res){
    //note: variables verification is done in a middleware
    //get required variables for the database query
    let id = req.params.id;
    let {title,price,stock,type} = req.query;
    price = parseInt(price);
    stock = parseInt(stock);
    let imageName = res.locals.imageName;
    let imageURL = res.locals.imageURL;

    //update data
    const updateGame = await database.updateGame(id,title,price,stock,type,imageURL,imageName);
    let updateGameStatus = updateGame.status;
    let oldValues = updateGame.oldValues;
    if (updateGameStatus === 200){
        //delete the old image
        if (imageName){
            //only delete if we have updated the image
            let output = await fireBaseStorage.deleteImage(oldValues.imageName);
            //error handling
            if (output["error"]){
                console.log("error while deleting an image from firebase");
            }
        }
        //log the username action
        let username = res.locals.username;
        database.logUserAction(username,`Updated old values(title: ${oldValues.title} /type: ${oldValues.type} /price: ${oldValues.price}/ stock: ${oldValues.stock}) new values (title: ${title} /type: ${type} /price: ${price}/ stock: ${stock})`);
    }
    //send the response
    res.sendStatus(updateGameStatus);

}

async function api_getOrder(req,res){
    let verificationStatus = parseInt(req.params.verificationStatus);
    if (isNaN(verificationStatus)){
        res.sendStatus(400);
        return;
    }
    let data = await database.getOrders(verificationStatus);
    if (data["error"]){
        res.sendStatus(502)
    }else{
        res.status(200);
        res.json(data);
    }
}
async function api_declineOrder(req,res){
    const username = res.locals.username;

    const orderID = req.params.orderID;
    const statusCode = await database.declineOrder(orderID);
    //log admin action
    if (statusCode === 200){
        database.logUserAction(username,`Declined ${orderID}`);
    }
    //send a status code back
    res.sendStatus(statusCode);
}
async function api_verifyOrder(req,res){
    const username = res.locals.username;
    
    const orderID = req.params.orderID;
    let statusCode = await database.verifyOrder(orderID);

    //log admin action
    if (statusCode === 200){
        database.logUserAction(username,`Verified ${orderID}`);
    }
    //send a status code back
    res.sendStatus(statusCode);
}

module.exports = {
                    api_getAllgames,
                    api_getGameByTitle,api_getMultipleGamesByID,
                    api_addGame,
                    api_removeGame,
                    api_updateGame,
                    api_getOrder,
                    api_verifyOrder,api_declineOrder}
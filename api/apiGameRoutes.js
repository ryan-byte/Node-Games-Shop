const jwt = require("jsonwebtoken");
const database = require("../server/database/database");
const fireBaseStorage = require("../server/utils/firebaseStorage");
const cookie = require("cookie");

const accessCookieName = "login";

//public api
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

//admins api
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
                console.log(output["error"]);
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
                console.log(output["error"]);
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
    let output = await database.verifyOrder(orderID);

    //log admin action
    if (output.status === 200){
        //send a message back to the client
        if (output.message){
            res.status(200).send({error:true,message:output.message});
            return;
        }
        res.status(200).send({error:false,message:"order has been verified"});
        database.logUserAction(username,`Verified ${orderID}`);
        return;
    }
    //send a status code back
    res.sendStatus(output.status);
}


async function api_getSalesHistory(req,res){
    let gameID = req.params.gameID;
    let data = await database.getSaleHistory(gameID);
    if (data["error"]){
        res.sendStatus(502)
    }else{
        res.status(200);
        res.json(data);
    }
}

async function api_getLogs(req,res){
    let {skip,limit} = req.query;
    skip = parseInt(skip);
    limit = parseInt(limit);

    let data = await database.getLogs(skip,limit);
    if (data["error"]){
        res.sendStatus(502)
    }else{
        res.status(200);
        res.json(data);
    }
}

//normal users api
async function api_getLatestOrders(req,res){
    //get the user ID that is stored in the cookie
    //note that the cookie must be verified in a middleware before this route
    let allCookies = cookie.parse(req.headers.cookie || "");
    let accessToken = allCookies[accessCookieName];
    let userID = jwt.decode(accessToken).userID;

    let data = await database.getUserLatestOrders(userID);
    if (data["error"]){
        res.sendStatus(502)
    }else{
        res.status(200).json(data);
    }
}
async function api_getAllUserDeliveryInfo(req,res){
    //get the user ID that is stored in the cookie
    //note that the cookie must be verified in a middleware before this route
    let allCookies = cookie.parse(req.headers.cookie || "");
    let accessToken = allCookies[accessCookieName];
    let userID = jwt.decode(accessToken).userID;

    let data = await database.getAllUserDeliveryInfo(userID);
    if (data["error"]){
        res.sendStatus(502);
    }else{
        res.status(200).json(data);
    }
}
async function api_getSpecificUserDeliveryInfo(req,res){
    //get the user ID that is stored in the cookie
    //note that the cookie must be verified in a middleware before this route
    let deliveryInfoId = req.query.deliveryInfoId;

    let allCookies = cookie.parse(req.headers.cookie || "");
    let accessToken = allCookies[accessCookieName];
    let userID = jwt.decode(accessToken).userID;

    let data = await database.getSpecificUserDeliveryInfo(userID,deliveryInfoId);
    if (data === null){
        res.sendStatus(404);
    }else if (data["error"]){
        res.sendStatus(data.status);
    }else{
        let output = {
            "FirstName":data.FirstName,
            "LastName":data.LastName,
            "TelNumber":data.TelNumber,
            "Address":data.Address,
            "City":data.City,
            "PostalCode":data.PostalCode,
        }
        res.status(200).json(output);
    }
}


module.exports = {  api_getAllgames,
                    api_getGameByTitle,api_getMultipleGamesByID,
                    api_addGame,
                    api_removeGame,
                    api_updateGame,
                    api_getOrder,
                    api_verifyOrder,api_declineOrder,
                    api_getSalesHistory,
                    api_getLatestOrders,api_getAllUserDeliveryInfo,api_getSpecificUserDeliveryInfo,
                    api_getLogs}
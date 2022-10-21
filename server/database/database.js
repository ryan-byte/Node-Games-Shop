const {MongoClient,ObjectId} = require("mongodb");
const {BSONTypeError} = require("bson");
const hashPassword = require("../utils/hashPassword");
const dbUtils = require("../utils/dbUtils");

const URL = process.env.mongoURL;
const client = new MongoClient(URL);
const gameShopDB = client.db("GameShop");
const gamesCollection = gameShopDB.collection("Games");
const adminCollection = gameShopDB.collection("admin");
const userCollection = gameShopDB.collection("users");
const ordersCollection = gameShopDB.collection("orders");
const userInfoCollection = gameShopDB.collection("userInfo");
const logsCollection = gameShopDB.collection("logs");
const unverifiedUsersCollection = gameShopDB.collection("unverifiedUsers");
const SalesProductsCollection = gameShopDB.collection("SalesProducts");

const unverifiedUserDataExpirationTimeInSec = parseInt(process.env.unverifiedUserDataExpirationTimeInSec) || 1800;
const unverifiedUser_Expiration_IndexName = "unverified_User_Expiration";

const logsExpirationTimeInSec = parseInt(process.env.logsExpirationTimeInSec) || 2592000;
const logsExpiration_IndexName = "logs_Expiration";


setupIndexes()
async function setupIndexes(){
    let collectionNames = await gameShopDB.listCollections({},{nameOnly:true}).toArray();

    await dbUtils.createTTLIndex(gameShopDB,collectionNames,unverifiedUsersCollection,unverifiedUser_Expiration_IndexName,unverifiedUserDataExpirationTimeInSec);
    await dbUtils.createTTLIndex(gameShopDB,collectionNames,logsCollection,logsExpiration_IndexName,logsExpirationTimeInSec);
    
    console.log("\x1b[33m" + "Database is ready" + "\x1b[0m");
}


const getAllgames = async ()=>{
    try{
        let allGames = await gamesCollection.find({}).toArray();
        return allGames;
    }catch (err){
        console.error("getting all games error:\n\n" + err);
        return {error:"db error"}
    }
}
const getGamesByTitle = async (title)=>{
    try{
        const query = {title:{$regex:`${title}`,$options:"i"}};
        let getGames = await gamesCollection.find(query).toArray()
        return getGames;
    }catch (err){
        console.error("getting all games by title error:\n\n" + err);
        return {error:"db error"}
    }
}
async function getGamesByIDs(gamesIDsArray){
    try{
        for (let i = 0;i<gamesIDsArray.length; i++){
            gamesIDsArray[i] = new ObjectId(gamesIDsArray[i]);
        }
        let query = {"_id": {$in: gamesIDsArray}};
        let allGames = await gamesCollection.find(query).toArray();
        return allGames;
    }catch (err){
        return {error:"db error"}
    }
}
//admin users
const addNewGame = async (title,price,stock,type,imageURL,imageName)=>{
    const validInputs = typeof title === "string" && 
                        typeof price === "number" && 
                        typeof stock === "number" && 
                        typeof type === "string";
    if (validInputs){
        const newGame = {title,price,stock,type,imageURL,imageName}
        try{
            await gamesCollection.insertOne(newGame)
            return 201;
        }catch (err){
            console.error("adding new game error:\n\n" + err);
            return {error:"db error"}
        }
    }else{
        return 400;
    }
}
const removeGame = async (id)=>{
    try{
        const query = {"_id": new ObjectId(id)};
        let output = await gamesCollection.findOneAndDelete(query);
        if (output.value === null){
            return {status:404};
        }
        return {status:200,title:output.value.title,imageName:output.value.imageName};
    }catch(err){
        return {status:400};
    }
}
const updateGame = async (id,title,price,stock,type,imageURL = undefined,imageName = undefined)=>{
    try{
        const validInputs = typeof id === "string"&&
                            typeof title === "string"&&
                            typeof price === "number"&&
                            typeof stock === "number"&&
                            typeof type === "string";
        if (!validInputs){
            return {status:400};
        }
        const filter = {"_id": new ObjectId(id)};
        let updateDoc = {
            $set:{
                title,
                price,
                stock,
                type
            }
        };
        if (imageName){
            //if the file is uploaded then update the database imageName field
            updateDoc = {
                $set:{
                    title,
                    price,
                    stock,
                    type,
                    imageURL,
                    imageName
                }
            };
        }

        let output = await gamesCollection.findOneAndUpdate(filter,updateDoc);
        if (output.value === null){
            return {status:404};
        }
        return {status:200,oldValues:output.value};
    }catch(err){
        console.error("updating game error:\n\n" + err);
        return {status:400};
    }
}

const createAdmin = async (username,hashedPassword,hashKey)=>{
    try{
        await adminCollection.insertOne({username,hashedPassword,hashKey});
        return true;
    }catch(err){
        console.error("creating admin error:\n\n" + err);
        return false;
    }
}
const getAdmin = async (username)=>{
    try{
        let data = await adminCollection.findOne({username: {$regex : new RegExp("^"+username+"$","i")}});
        return data;
    }catch(err){
        return {"error":err};
    }
}
const verifyAdmin = async (username,password)=>{
    try{
        //get the admin data
        let adminData = await getAdmin(username);
        if (adminData === null){
            return false;
        }else if (adminData["error"]){
            return adminData;
        }
        //hash the given password with the hashKey that is stored in the admin data
        let hashedPassword = hashPassword(password,adminData.hashKey);
        //verify if the hashedpassword is the same as the stored one
        if (hashedPassword === adminData.hashedPassword){
            return {"userID":adminData._id.toString()};
        }
        return false;
    }catch (err){
        return {"error":err};
    }
}

async function getOrders(verificationStatus){
    try{
        if (verificationStatus === 0){
            let allOrders = await ordersCollection.find({verificationStatus}).toArray();
            return allOrders;
        }else{
            const latestOrdersTimestamp = { modifiedTimestamp: -1 };
            let allOrders = await ordersCollection.find({verificationStatus}).sort(latestOrdersTimestamp).toArray();
            return allOrders;
        }
    }catch (err){
        console.error("getting all orders (for admins) error:\n\n" + err);
        return {error:"db error"};
    }
}
async function verifyOrder(orderID){
    try{
        //get bought games with their quantity from the order
        const orderDoc = {"_id": new ObjectId(orderID),"verificationStatus":0};
        let output = await ordersCollection.findOne(orderDoc);
        const userID = output.userID;
        const gamesIDAndQuantity = output.Games;
        if (gamesIDAndQuantity === undefined){
            return {status:404};
        }
        //check if there is still games in stock
        const gamesIDAndStock = await getGamesStock(Object.keys(gamesIDAndQuantity));
        let enoughInStock = dbUtils.enoughGamesInStock(Object.keys(gamesIDAndQuantity),gamesIDAndQuantity,gamesIDAndStock);
    
        if (enoughInStock){
            //there is enough in stock
            let timeStamp = Math.floor(Date.now() / 1000);
            let verifyOrder = {
                $set:{
                    "modifiedTimestamp":timeStamp,
                    "verificationStatus":1
                }
            };
            //reduce stock
            let stockReducedSuccessfully = await reduceStock(Object.keys(gamesIDAndQuantity),gamesIDAndQuantity);
            //verify order
            if (stockReducedSuccessfully){
                await ordersCollection.updateOne(orderDoc,verifyOrder);
            }
            //save ordered games in a Sales history collection
            let gamesQuantityAndPriceList = await getGamesMoney(gamesIDAndQuantity);
            await saveProductToSalesHistory(gamesQuantityAndPriceList,userID);
            
        }else{
            //not enough in stock
            return {status:200,message:"out of stock"};
        }
        return {status:200};

    }catch (err){
        if(err instanceof BSONTypeError){
            return {status:400};
        }else{
            console.error("verifying order error:\n\n" + err);
            return {status:502};
        }
    }
}
async function declineOrder(orderID){
    try{
        const filter = {"_id": new ObjectId(orderID),"verificationStatus":0};
        let timeStamp = Math.floor(Date.now() / 1000);
        let updateDoc = {
            $set:{
                "modifiedTimestamp":timeStamp,
                "verificationStatus":2
            }
        };
        let output = await ordersCollection.findOneAndUpdate(filter,updateDoc);
        if (output.value === null){
            return 404;
        }
        return 200;
    }catch (err){
        if(err instanceof BSONTypeError){
            return 400;
        }else{
            console.error("declining order error:\n\n" + err);
            return 502;
        }
    }
}

async function getSaleHistory(gameID){
    try{
        const latestTimestamp = { timeStamp: -1 };
        let gameSalesHistory = await SalesProductsCollection.find({"gameID":gameID}).sort(latestTimestamp).toArray();
        return gameSalesHistory;
    }catch (err){
        console.error("getting game sales history (for admins) error:\n\n" + err);
        return {error:"db error"};
    }
}
//normal user
async function userExist(username,email){
    try{
        let userExistData =await userCollection.findOne({$or:[{username},{email}]});
        if (userExistData === null) return false;
        else return true;
    }catch(error){
        return {error};
    }
}
async function createUnverifiedUser(username,email,hashedPassword,hashKey,verificationCode){
    try{
        let checkIfUserExists= await userExist(username,email);
        if (!checkIfUserExists){
            //createdAt is used as an index so the data will be deleted after some time
            let createdAt = new Date();
            let output = await unverifiedUsersCollection.insertOne({username,email,hashedPassword,hashKey,verificationCode,createdAt});
            return {status:true,userID:output.insertedId.toString()};
        }else {
            return {status:false};
        }
    }catch(err){
        console.error("creating unverified user error:\n\n" + err);
        return {error:"db error"};
    }
}
async function deleteUnverifiedUser(userID){
    try{
        const query = {"_id": new ObjectId(userID)};
        await unverifiedUsersCollection.deleteOne(query);
    }catch(err){
        return {"error":err};
    }
}
async function createVerifiedUser(username,email,hashedPassword,hashKey){
    try{
        let output = await userCollection.insertOne({username,email,hashedPassword,hashKey});
        return {userID:output.insertedId.toString()};
    }catch(err){
        console.error("creating verified user error:\n\n" + err);
        return {error:"db error"};
    }
}
async function verifyUserSignup(userID,code){
    try{
        let userObjectID = new ObjectId(userID);
        let query = {"_id": userObjectID};
        let user = await unverifiedUsersCollection.findOne(query);

        let verifiedCode = user.verificationCode.toString();
        if (code === verifiedCode){
            return {status:true,userID,data:user};
        }else{
            return {status:false};
        }
    }catch(err){
        console.error("verification of user signup error:\n\n" + err);
        return {error:"db error"};
    }
}
async function getUser(username){
    try{
        let data = await userCollection.findOne({username: {$regex : new RegExp("^"+username+"$","i")}});
        return data;
    }catch(err){
        return {"error":err};
    }
}
async function verifyUserCredentials(username,password){
    try{
        //get the admin data
        let userData = await getUser(username);
        if (userData === null){
            return false;
        }else if (userData["error"]){
            return userData;
        }
        //hash the given password with the hashKey that is stored in the admin data
        let hashedPassword = hashPassword(password,userData.hashKey);
        //verify if the hashedpassword is the same as the stored one
        if (hashedPassword === userData.hashedPassword){
            return {"userID":userData._id.toString()};
        }
        return false;
    }catch (err){
        return {"error":err};
    }
}

async function getUserLatestOrders(userID){
    try{
        const latestTimestamp = { timeStamp: -1 };
        let latestOrders = await ordersCollection.find({userID}).sort(latestTimestamp).toArray();
        return latestOrders;
    }catch (err){
        console.error("get user latest orders error:\n\n" + err);
        return {error:"db error"};
    }
}

async function createNewOrder(userID,FirstName,LastName,TelNumber,Address,City,PostalCode,Games){
    const validInputs = typeof userID === "string" && 
                        typeof FirstName === "string" && 
                        typeof LastName === "string" && 
                        typeof City === "string" && 
                        typeof PostalCode === "string" && 
                        typeof TelNumber === "string" && 
                        typeof Games === "object" && 
                        typeof Address === "string";
    if (validInputs){
        let timeStamp = Math.floor(Date.now() / 1000);
        const newOrder = {userID,FirstName,LastName,TelNumber,Address,City,PostalCode,verificationStatus:0,Games,timeStamp};
        try{
            //get Games price list
            let gamesQuantityAndPriceList = await getGamesMoney(Games);
            //get total money
            let total = dbUtils.calculateGamesTotalMoney(gamesQuantityAndPriceList);
            //save order
            newOrder.total= total;
            await ordersCollection.insertOne(newOrder);
            return 201;
        }catch (err){
            console.error("creating order error:\n\n" + err);
            return 502;
        }
    }else{
        return 400;
    }
}

async function addUserDeliveryInfo(userID,FirstName,LastName,TelNumber,Address,City,PostalCode){
    const validInputs = typeof userID === "string" && 
                        typeof FirstName === "string" && 
                        typeof LastName === "string" && 
                        typeof City === "string" && 
                        typeof PostalCode === "string" && 
                        typeof TelNumber === "string" && 
                        typeof Address === "string";
    if (validInputs){
        let date = new Date();
        const newUserInfo = {userID,FirstName,LastName,TelNumber,Address,City,PostalCode,date};
        try{
            await userInfoCollection.insertOne(newUserInfo)
            return 201;
        }catch (err){
            console.error("adding user delivery information error:\n\n" + err);
            return 502;
        }
    }else{
        return 400;
    }
}
async function editUserDeliveryInfo(userID,deliveryInfoId,FirstName,LastName,TelNumber,Address,City,PostalCode){
    const validInputs = typeof deliveryInfoId === "string" &&
                        typeof userID === "string" && 
                        typeof FirstName === "string" && 
                        typeof LastName === "string" && 
                        typeof City === "string" && 
                        typeof PostalCode === "string" && 
                        typeof TelNumber === "string" && 
                        typeof Address === "string";
    if (validInputs){
        const editedData = new Date();
        const updateDoc = {
            $set:{
                FirstName,
                LastName,
                TelNumber,
                Address,
                City,
                PostalCode,
                editedData
            }
        };
        try{
            const filter = {"_id": new ObjectId(deliveryInfoId),userID};
            let output = await userInfoCollection.updateOne(filter,updateDoc);
            if (output.matchedCount === 1){
                return 201;
            }else{
                return 404;
            }
        }catch (err){
            if(err instanceof BSONTypeError){
                return 404;
            }else{
                return 502;
            };
        }
    }else{
        return 400;
    }
}

async function getAllUserDeliveryInfo(userID){
    try{
        let data = await userInfoCollection.find({userID}).toArray();
        return data;
    }catch (err){
        console.error("getting all user delivery information error:\n\n" + err);
        return {error:"db error"};
    }
}
async function getSpecificUserDeliveryInfo(userID,deliveryInfoId){
    try{
        let data = await userInfoCollection.findOne({"_id": new ObjectId(deliveryInfoId),userID});
        return data;
    }catch (err){
        if(err instanceof BSONTypeError){
            return {error:"db error",status:404};
        }else{
            return {error:"db error",status:502};
        }
    }
}

//openID user
async function openID_userExist(service,email){
    try{
        let userExistData = await userCollection.findOne({email});
        if (userExistData === null){
            return {userCanBeCreated:true};
        }else{
            let openID_user_service = userExistData.service;
            if (openID_user_service === service){
                return {userCanBeCreated:false,canLogin:true};
            }else{
                return {userCanBeCreated:false,canLogin:false};
            }
        };
    }catch(error){
        return {error};
    }
}
async function openID_saveUser(service,id,email,name){
    try{
        let output = await userCollection.insertOne({service,id,email,name});
        return {userID:output.insertedId.toString()};
    }catch(error){
        return {error};
    }
}
async function openID_userLogin(service,id,email,name){
    try{
        let output = await userCollection.findOne({service,id,email,name});
        return {userID:output._id.toString()};
    }catch(error){
        return {error};
    }
}



async function logUserAction(username,action){
    try{
        let timeStamp = Math.floor(Date.now() / 1000)
        await logsCollection.insertOne({username,action,timeStamp});
    }catch(err){
        console.error("log user action error:\n\n" + err);
    }
}

async function getGamesMoney(gamesIDAndQuantity){
    let gamesIDList = Object.keys(gamesIDAndQuantity);
    for (let i = 0; i<gamesIDList.length; i++){
        gamesIDList[i] = {"_id":new ObjectId(gamesIDList[i])};
    }
    //get all the games with only the price field
    const query = {$or:gamesIDList};
    let output = await gamesCollection.find(query).project({price:1}).toArray();

    //clean output
    let priceList = {};
    for (let i = 0; i<output.length; i++){
        priceList[output[i]._id] = {price :output[i].price, quantity: gamesIDAndQuantity[output[i]._id]};
    }

    return priceList;
}

async function saveProductToSalesHistory(gamesQuantityAndPriceList,buyerID){
    let gameIDs = Object.keys(gamesQuantityAndPriceList)
    try{
        //prepare the documents to be saved
        let timeStamp = Math.floor(Date.now() / 1000);
        let docs = [];
        for (let i = 0; i<gameIDs.length; i++){
            let quantity = gamesQuantityAndPriceList[gameIDs[i]].quantity;
            let price = gamesQuantityAndPriceList[gameIDs[i]].price;
            let gameSales = {
                "gameID":gameIDs[i],
                "unitPrice":price,
                "quantity":quantity,
                "total":quantity * price,
                "buyerID":buyerID,
                timeStamp
            };
            docs.push(gameSales);
        }
        await SalesProductsCollection.insertMany(docs);
    }catch(err){
        console.error("save product to Sales history error:\n\n" + err);
    }
}

async function getGamesStock(gamesIDList){
    try{
        for (let i = 0; i<gamesIDList.length; i++){
            gamesIDList[i] = {"_id":new ObjectId(gamesIDList[i])};
        }
        //get all the games with only the stock field
        const query = {$or:gamesIDList};
        let output = await gamesCollection.find(query).project({stock:1}).toArray();
    
        //clean output
        let stockList = {};
        for (let i = 0; i<output.length; i++){
            stockList[output[i]._id] = output[i].stock;
        }
    
        return stockList;
    }catch (err){
        console.error("get games Stock error:\n\n" + err);
    }
}

async function reduceStock(gamesIDList,gamesIDAndQuantity){
    try{
        let bulkRequest = [];
        for (let i = 0; i<gamesIDList.length; i++){
            let gameID = gamesIDList[i];
            let request = {
                updateOne:{
                    "filter":{"_id": new ObjectId(gameID)},
                    "update":{$inc: {stock: -1 * gamesIDAndQuantity[gameID]}}
                }
            };
            bulkRequest.push(request);
        }
        await gamesCollection.bulkWrite(bulkRequest);
        return true;
    }catch (err){
        console.error("reduce stock error:\n\n" + err);
        return false;
    }
}


module.exports = {getAllgames,getGamesByTitle,getGamesByIDs,
                addNewGame,removeGame,updateGame,
                createAdmin,getAdmin,verifyAdmin,logUserAction,
                createNewOrder,getOrders,addUserDeliveryInfo,editUserDeliveryInfo,
                getAllUserDeliveryInfo,getSpecificUserDeliveryInfo,
                verifyOrder,declineOrder,
                verifyUserCredentials,createUnverifiedUser,deleteUnverifiedUser,
                getUserLatestOrders,
                verifyUserSignup,createVerifiedUser,
                getSaleHistory,
                openID_userExist,openID_saveUser,openID_userLogin};
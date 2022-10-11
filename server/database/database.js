const {MongoClient,ObjectId} = require("mongodb");
const {BSONTypeError} = require("bson");
const hashPassword = require("../utils/hashPassword");

const URL = process.env.mongoURL;
const client = new MongoClient(URL);
const gameShopDB = client.db("GameShop");
const gamesCollection = gameShopDB.collection("Games");
const adminCollection = gameShopDB.collection("admin");
const userCollection = gameShopDB.collection("users");
const ordersCollection = gameShopDB.collection("orders");
const logsCollection = gameShopDB.collection("logs");
const unverifiedUsersCollection = gameShopDB.collection("unverifiedUsers")

const unverifiedUserDataExpirationTimeInSec = parseInt(process.env.unverifiedUserDataExpirationTimeInSec) || 1800;

setupIndexes()
async function setupIndexes(){
    let indexExist = await unverifiedUsersCollection.indexExists("createdAt_1");
    console.log("Setting up unverified users expiration index");
    if (!indexExist){
        //creating a ttl index that will delete the unverified user data after some seconds
        unverifiedUsersCollection.createIndex({"createdAt":1},{expireAfterSeconds:unverifiedUserDataExpirationTimeInSec});
        console.log(`Index has been created, unverified users data will expire after its creation by ${unverifiedUserDataExpirationTimeInSec} sec.`);
    }else{
        console.log("Index already exists");
        unverifiedUsersCollection.dropIndex("createdAt_1");
        console.log("Index has been dropped");
        console.log("Creating expiration index");
        unverifiedUsersCollection.createIndex({"createdAt":1},{expireAfterSeconds:unverifiedUserDataExpirationTimeInSec});
        console.log(`Index has been created, unverified users data will be deleted after its creation by ${unverifiedUserDataExpirationTimeInSec} sec.`);
    }
    console.log("\x1b[33m" + "Database is ready" + "\x1b[0m");
}


const getAllgames = async ()=>{
    try{
        let allGames = await gamesCollection.find({}).toArray();
        return allGames;
    }catch (err){
        console.error(err)
        return {error:"db error"}
    }
}
const getGamesByTitle = async (title)=>{
    try{
        const query = {title:{$regex:`${title}`,$options:"i"}};
        let getGames = await gamesCollection.find(query).toArray()
        return getGames;
    }catch (err){
        console.error(err)
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
            console.log(err);
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
        console.log(err);
        return {status:400};
    }
}

const createAdmin = async (username,hashedPassword,hashKey)=>{
    try{
        await adminCollection.insertOne({username,hashedPassword,hashKey});
        return true;
    }catch(err){
        console.error(err);
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
        console.error(err);
        return {error:"db error"};
    }
}
async function deleteUnverifiedUser(userID){
    try{
        console.log(userID);
        const query = {"_id": new ObjectId(userID)};
        let test = await unverifiedUsersCollection.deleteOne(query);
    }catch(err){
        return {"error":err};
    }
}
async function createVerifiedUser(username,email,hashedPassword,hashKey){
    try{
        let output = await userCollection.insertOne({username,email,hashedPassword,hashKey});
        return {userID:output.insertedId.toString()};
    }catch(err){
        console.error(err);
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
        console.error(err);
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

async function logUserAction(username,action){
    try{
        let timeStamp = Math.floor(Date.now() / 1000)
        await logsCollection.insertOne({username,action,timeStamp});
    }catch(err){
        console.error(err);
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
            await ordersCollection.insertOne(newOrder)
            return 201;
        }catch (err){
            console.log(err);
            return 500;
        }
    }else{
        return 400;
    }
}

async function getOrders(verificationStatus){
    try{
        let allOrders = await ordersCollection.find({verificationStatus}).toArray();
        return allOrders;
    }catch (err){
        console.error(err)
        return {error:"db error"};
    }
}
async function verifyOrder(orderID){
    try{
        const filter = {"_id": new ObjectId(orderID),"verificationStatus":0};
        let updateDoc = {
            $set:{
                "verificationStatus":1
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
            console.error(err);
            return 502;
        }
    }
}
async function declineOrder(orderID){
    try{
        const filter = {"_id": new ObjectId(orderID),"verificationStatus":0};
        let updateDoc = {
            $set:{
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
            console.error(err);
            return 502;
        }
    }
}


async function getUserLatestOrders(userID){
    try{
        const latestTimestamp = { timeStamp: -1 };
        let latestOrders = await ordersCollection.find({userID}).sort(latestTimestamp).toArray();
        return latestOrders;
    }catch (err){
        console.error(err)
        return {error:"db error"};
    }
}

module.exports = {getAllgames,getGamesByTitle,getGamesByIDs,
                addNewGame,removeGame,updateGame,
                createAdmin,getAdmin,verifyAdmin,logUserAction,
                createNewOrder,getOrders,
                verifyOrder,declineOrder,
                verifyUserCredentials,createUnverifiedUser,deleteUnverifiedUser,
                getUserLatestOrders,
                verifyUserSignup,createVerifiedUser};
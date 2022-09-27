const {MongoClient,ObjectId} = require("mongodb");
const hashPassword = require("../utils/hashPassword");

const URL = process.env.mongoURL;
const client = new MongoClient(URL);
const gameShopDB = client.db("GameShop");
const gamesCollection = gameShopDB.collection("Games");
const adminCollection = gameShopDB.collection("admin");
const logsCollection = gameShopDB.collection("logs");

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
        const query = {title:{$regex:title}};
        let getGames = await gamesCollection.find(query).toArray()
        return getGames;
    }catch (err){
        console.error(err)
        return {error:"db error"}
    }
}

const addNewGame = async (title,price,stock,type,imageName)=>{
    const validInputs = typeof title === "string" && 
                        typeof price === "number" && 
                        typeof stock === "number" && 
                        typeof type === "string";
    if (validInputs){
        const newGame = {title,price,stock,type,imageName}
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
const updateGame = async (id,title,price,stock,type,imageName = undefined)=>{
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
    }catch(err){
        console.error(err);
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
            return true;
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

module.exports = {getAllgames,getGamesByTitle,
                addNewGame,removeGame,updateGame,
                createAdmin,getAdmin,verifyAdmin,logUserAction};
const {MongoClient,ObjectId} = require("mongodb");
const {password} = require("./databasePwd.json")
const hashPassword = require("../utils/hashPassword");

const URI = `mongodb+srv://thesoulsreaper:${password}@cluster0.muz1azg.mongodb.net/?retryWrites=true&w=majority`
const client = new MongoClient(URI);
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

const addNewGame = async (title,price,stock,type)=>{
    const validInputs = typeof title === "string" && 
                        typeof price === "number" && 
                        typeof stock === "number" && 
                        typeof type === "string";
    if (validInputs){
        const newGame = {title,price,stock,type}
        try{
            await gamesCollection.insertOne(newGame)
        }catch (err){
            console.log(err);
            return {error:"db error"}
        }
    }
    return validInputs;
}
const removeGame = async (id)=>{
    try{
        const query = {"_id": new ObjectId(id)};
        let output = await gamesCollection.findOneAndDelete(query);
        if (output.value === null){
            return {status:404};
        }
        return {status:200,title:output.value.title};
    }catch(err){
        return {status:400};
    }
}
const updateGame = async (id,title,price,stock,type)=>{
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
        const updateDoc = {
            $set:{
                title,
                price,
                stock,
                type
            }
        };
        let output = await gamesCollection.findOneAndUpdate(filter,updateDoc);
        if (output.value === null){
            return {status:404};
        }
        return {status:200,oldValues:output.value};
    }catch(err){
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
        let adminData = await getAdmin(username);
        if (adminData === null){
            return false;
        }else if (adminData["error"]){
            return adminData;
        }
        let hashedPassword = hashPassword(password,adminData.hashKey);
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
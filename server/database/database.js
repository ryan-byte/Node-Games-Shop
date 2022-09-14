const {MongoClient,ObjectId} = require("mongodb");
const {password} = require("./databasePwd.json")
const URI = `mongodb+srv://thesoulsreaper:${password}@cluster0.muz1azg.mongodb.net/?retryWrites=true&w=majority`

const client = new MongoClient(URI);
const gameShopDB = client.db("GameShop");
const gamesCollection = gameShopDB.collection("Games");


const getAllgames = async ()=>{
    try{
        let allGames = await gamesCollection.find({}).toArray();
        return allGames;
    }catch (err){
        console.error(err)
        return {error:"connection to db error"}
    }
}
const getGamesByTitle = async (title)=>{
    try{
        const query = {title:{$regex:title}};
        let getGames = await gamesCollection.find(query).toArray()
        return getGames;
    }catch (err){
        console.error(err)
        return {error:"connection to db error"}
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
            console.error(err)
        }
    }
    return validInputs;
}

const removeGame = async (id)=>{
    try{
        const query = {"_id": new ObjectId(id)};
        let output = await gamesCollection.deleteOne(query);
        if (output.deletedCount === 0){
            return 404;
        }
        return 200;
    }catch(err){
        return 400;
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
            return 400;
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
        let output = await gamesCollection.updateOne(filter,updateDoc);
        if (output.matchedCount === 0){
            return 404;
        }
        return 200;
    }catch(err){
        return 400;
    }
}

module.exports = {getAllgames,getGamesByTitle,addNewGame,removeGame,updateGame};
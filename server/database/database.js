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
    const validateInputs = typeof title === "string" && 
                        typeof price === "number" && 
                        typeof stock === "number" && 
                        typeof type === "string";
    if (validateInputs){
        const newGame = {title,price,stock,type}
        try{
            await gamesCollection.insertOne(newGame)
        }catch (err){
            console.error(err)
        }
    }
    return validateInputs;
}

const removeGame = async (id)=>{
    try{
        const query = {"_id": new ObjectId(id)};
        let testdata = await gamesCollection.deleteOne(query);
        if (testdata.deletedCount === 0){
            return false;
        }
        return true;
    }catch(err){
        return false;
    }
}

module.exports = {getAllgames,getGamesByTitle,addNewGame,removeGame};
const {MongoClient} = require("mongodb");
const {password} = require("./databasePwd.json")
const URI = `mongodb+srv://thesoulsreaper:${password}@cluster0.muz1azg.mongodb.net/?retryWrites=true&w=majority`

const client = new MongoClient(URI);
const gameShopDB = client.db("GameShop");
const gamesCollection = gameShopDB.collection("Games");


const getAllgames = async ()=>{
    let allGames = await gamesCollection.find({}).toArray();
    return allGames;
}
const getGamesByTitle = async (title)=>{
    const query = {title:{$regex:title}};
    let getGames = await gamesCollection.find(query).toArray()
    return getGames;
}

module.exports = {getAllgames,getGamesByTitle};
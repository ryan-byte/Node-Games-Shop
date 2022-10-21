function calculateGamesTotalMoney(gamesQuantityAndPriceList){
    let total = 0;
    let gameIDs = Object.keys(gamesQuantityAndPriceList);
    for (let i = 0; i <gameIDs.length; i++){
        total += gamesQuantityAndPriceList[gameIDs[i]].price * gamesQuantityAndPriceList[gameIDs[i]].quantity;
    }
    return total;
}
function enoughGamesInStock(gamesIDList,gamesIDAndQuantity,gamesIDAndStock){
    for (let i = 0; i<gamesIDList.length; i++){
        if (gamesIDAndQuantity[gamesIDList[i]] > gamesIDAndStock[gamesIDList[i]]){
            return false;
        }
    }
    return true;
}

async function createTTLIndex(DB,collectionNames,collection,indexName,expirationTime){

    //create collection if it doesnt exist (this is required to set index)
    let createCollection = true;
    for (let i = 0; i<collectionNames.length; i++){
        if (collectionNames[i].name === collection.collectionName){
            createCollection = false;
        }
    }
    if (createCollection){
        console.log("\x1b[31m" + `Creating ${collection.collectionName} collection...`+ "\x1b[0m");
        await DB.createCollection(collection.collectionName);
        console.log("\x1b[32m" + `Collection created`+ "\x1b[0m");
    }

    //setting up index
    let indexExist = await collection.indexExists(indexName);
    let allIndexes = await collection.indexes();
    console.log(`Setting up ${indexName} TTL index`);
    if (!indexExist){
        //creating a ttl index that will delete the unverified user data after some seconds
        collection.createIndex({"createdAt":1},
        {
            expireAfterSeconds:expirationTime,
            name:indexName
        });
        console.log(`Index has been created, ${indexName} data will expire after its creation by ${expirationTime} sec.`);
    }else{
        console.log("Index already exists");
        let dropAndChangeIndex = true;
        //if the index exist and its value arent changed then dont drop and create the index
        for (let i = 0;i<allIndexes.length; i++){
            if (allIndexes[i].name === indexName && allIndexes[i].expireAfterSeconds === expirationTime){
                console.log("Index values are unchanged");
                dropAndChangeIndex = false;
            }
        }

        if (dropAndChangeIndex){
            collection.dropIndex(indexName);
            console.log("Index has been dropped");
            console.log(`Creating ${indexName} expiration index`);
            collection.createIndex({"createdAt":1},
            {
                expireAfterSeconds:expirationTime,
                name:indexName
            });
            console.log(`Index has been created, ${indexName} data will expire after its creation by ${expirationTime} sec.`);
        }
    }
}

module.exports = {calculateGamesTotalMoney,enoughGamesInStock,createTTLIndex};
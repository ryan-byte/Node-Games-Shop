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

module.exports = {calculateGamesTotalMoney,enoughGamesInStock};
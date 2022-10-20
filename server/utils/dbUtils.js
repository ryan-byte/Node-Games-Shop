function calculateGamesTotalMoney(gamesQuantityAndPriceList){
    let total = 0;
    let gameIDs = Object.keys(gamesQuantityAndPriceList);
    for (let i = 0; i <gameIDs.length; i++){
        total += gamesQuantityAndPriceList[gameIDs[i]].price * gamesQuantityAndPriceList[gameIDs[i]].quantity;
    }
    return total;
}

module.exports = {calculateGamesTotalMoney};
function randomNumber(min,max){
    let random = Math.floor(Math.random() * (max - min) + min);
    return random;
};

module.exports = randomNumber;
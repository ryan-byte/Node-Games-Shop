const totalMoney = document.getElementById("totalMoney");
const gameList = document.getElementById("gameList");
const orderForm = document.getElementById("orderForm");

//events
window.addEventListener("storage",(ev)=>{
    //if the user tries to clear the cart value from the storage
    if (ev.key === "cart" || ev.key === null){
        onLoad();
    }
})
orderForm.addEventListener("submit",(ev)=>{
    let cart = localStorage.getItem("cart");
    if (cart){
        cart = JSON.parse(cart);
        if (cart.length === 0){
            ev.preventDefault();
            alert("cart is empty");
        }
    }else{
        ev.preventDefault();
        alert("cart is empty");
    }
})

//functions
onLoad();
function onLoad(){
    let cart = localStorage.getItem("cart");
    if (cart){
        cart = JSON.parse(cart);
        showTotalMoney(cart);
        showGames(cart);
    }else{
        totalMoney.innerText = 0;
        gameList.innerHTML = `<li class="list-group-item"></li>`;
    }
}

function showGames(cart){
    gameList.innerHTML = "";
    let newList = document.createElement("ul");
    newList.classList.add("list-group");
    gameList.appendChild(newList);
    for (let i = 0;i<cart.length; i++){
        let newItem = document.createElement("li");
        newItem.classList.add("list-group-item");
        newItem.innerText = `${cart[i].title}`;
        newList.appendChild(newItem);
    }

}
function showTotalMoney(cart){
    if (cart.length === 0){
        totalMoney.innerText= 0;
        return;
    }
    totalMoney.innerText = getTotalMoney(cart);
}
function getTotalMoney(cart){
    let total = 0;
    for (let i = 0; i<cart.length; i++){
        let price = cart[i].price;
        total += price;
    }
    return total;
}
const cart = document.getElementById("cartNum");
const gamesSide = document.getElementById("gamesSide");
const moneySide = document.getElementById("moneySide");


updateCartNumberOnLoadup();
function updateCartNumberOnLoadup(){
    let cart = localStorage.getItem("cart");
    if (cart){
        cart = JSON.parse(cart);
        changeCartNumber(cart.length);
        displayCartNumber(true);
    }else{
        displayCartNumber(false);        
    }
}


function updateCartUI(){
    let cart = localStorage.getItem("cart");
    if (cart){
        cart = JSON.parse(cart);
        let total = calculateTotalMoneyInCart(cart);
        moneySide.innerHTML = `
        <div id="totalMoney" style="text-align: center;font: bold;">
            <b>total:</b> ${total}.000 DT<br><br>
            <button type="button" class="btn btn-primary">Order</button>
        </div>`;
    }else{
        gamesSide.innerHTML = "EMPTY";
        moneySide.innerHTML = "0 DT";
    }
}

function storeGameInCart(data){
    if (typeof data === "string"){
        data = JSON.parse(data);
    }
    if (data.stock <= 0){
        alert("game is out of stock")
        return;
    }
    let cart = localStorage.getItem("cart");
    if (cart){
        //if the cart exist then push the new item
        //change cart back into an object
        cart = JSON.parse(cart);
        //check if the game already exists in the cart
        if (checkIfGameExistInCart(data,cart)){
            return;
        }
        //add the new data
        cart.push(data);
        //update the cart number
        changeCartNumber(cart.length);
        //change the cart to a string then update the localstorage value
        localStorage.setItem("cart",JSON.stringify(cart));
    }else{
        //else create the cart and add the first game
        localStorage.setItem("cart",JSON.stringify([data]));
        changeCartNumber(1);
        displayCartNumber(true);
    }
}
function clearCart(){
    localStorage.removeItem("cart");
    changeCartNumber(0);
    displayCartNumber(false);
}
function checkIfGameExistInCart(data,cart){
    let id = data["_id"];
    for (let i = 0; i<cart.length;i++){
        let game = cart[i];
        if (game["_id"] === id){
            return true;
        }
    }
    return false;
}
function calculateTotalMoneyInCart(cart){
    let total = 0;
    for (let i = 0; i<cart.length; i++){
        let price = cart[i].price;
        total += price;
    }
    return total;
}
function changeCartNumber(num){
    cart.innerText = num;
}
function displayCartNumber(bool){
    if (bool===true){
        cart.style.display = "block"; 
    }else if (bool === false){
        cart.style.display = "none";
    }
}
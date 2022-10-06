const cart = document.getElementById("cartNum");
const gamesSide = document.getElementById("gamesSide");
const totalMoney = document.getElementById("totalMoney");
const closeModal = document.getElementById("closeModal");
const cartButtons = document.getElementById("cartMoneyButtons");

//events
window.addEventListener("storage",(ev)=>{
    //if the user tries to clear the cart value from the storage
    if (ev.key === "cart" || ev.key === null){
        updateCartNumberOnLoadup();
        updateCartUI();
    }
})
function quantityChanged(elem){
    if (elem.value <0){
        elem.value = 0;
    }
    let quantity = localStorage.getItem("quantity"); 
    if (quantity === null){
        let newQuantity = {};
        newQuantity[elem.dataset.id] = parseInt(elem.value);
        localStorage.setItem("quantity",JSON.stringify(newQuantity));
    }else{
        let currentQuantity = JSON.parse(quantity);
        currentQuantity[elem.dataset.id] = parseInt(elem.value);
        localStorage.setItem("quantity",JSON.stringify(currentQuantity));
    }
}

//cart functions
updateCartNumberOnLoadup();
function updateCartNumberOnLoadup(){
    let cart = localStorage.getItem("cart");
    if (cart){
        cart = JSON.parse(cart);
        if (cart.length !==0){
            changeCartNumber(cart.length);
            displayCartNumber(true);
            return;
        }
    }
    displayCartNumber(false);        
}

function updateCartUI(){
    let cart = localStorage.getItem("cart");
    if (cart){
        cart = JSON.parse(cart);
        if (cart.length !== 0){
            showCartMoney(cart);
            showCartGames(cart);
            cartButtons.style.display = "block";
            return;
        }
    }
    gamesSide.innerHTML = "EMPTY";
    totalMoney.innerHTML = "0";
    cartButtons.style.display = "none";
}

function showCartGames(cart){
    gamesSide.innerHTML = "";
    for (let i = 0;i<cart.length; i++){
        let newDiv = document.createElement("div");
        newDiv.classList.add("d-flex","flex-row","bd-highlight","mb-3","position-relative","border","border-secondary","rounded");
        
        //get game quantity
        let quantity = localStorage.getItem("quantity");
        let currentGameQuantity = 1;
        if (quantity !== null){
            currentGameQuantity = JSON.parse(quantity)[cart[i]["_id"]];
            currentGameQuantity = currentGameQuantity === undefined ? 1: currentGameQuantity;
        }
        
        
        newDiv.innerHTML = `
        <div class = "pe-2">
            <img src="/images/${cart[i].imageName}" alt="">
        </div>
        <div>
            <b>Title: </b> ${cart[i].title} <br>
            <b>Price: </b> ${cart[i].price} DT <br>
            <b>Type: </b> ${cart[i].stock} <br>
            <b>Quantity: </b> <input data-id="${cart[i]["_id"]}" style="max-width:50px" min = "0" class = "quantity" type="number" onchange="quantityChanged(this)" value = "${currentGameQuantity}"><br>
        </div>
        <div class = "garbageButton position-absolute top-0 end-0" data-id = "${cart[i]["_id"]}" onclick = "deleteGameFromCart(this)">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="30" height="100%">
                <g id="_01_align_center" data-name="01 align center">
                    <path d="M22,4H17V2a2,2,0,0,0-2-2H9A2,2,0,0,0,7,2V4H2V6H4V21a3,3,0,0,0,3,3H17a3,3,0,0,0,3-3V6h2ZM9,2h6V4H9Zm9,19a1,1,0,0,1-1,1H7a1,1,0,0,1-1-1V6H18Z"/>
                    <rect x="9" y="10" width="2" height="8"/>
                    <rect x="13" y="10" width="2" height="8"/>
                </g>
            </svg>
        </div>`
        gamesSide.appendChild(newDiv);
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
        displayCartNumber(true);
        //change the cart to a string then update the localstorage value
        localStorage.setItem("cart",JSON.stringify(cart));
    }else{
        //else create the cart and add the first game
        localStorage.setItem("cart",JSON.stringify([data]));
        changeCartNumber(1);
        displayCartNumber(true);
    }
}
function deleteGameFromCart(elem){
    let id = elem.dataset.id;
    let cart = localStorage.getItem("cart");
    if (cart){
        cart = JSON.parse(cart);
        for (let i = 0; i<cart.length;i++){
            let game = cart[i];
            if (game["_id"] === id){
                //remove the game from the cart
                cart.splice(i,1);
                let len = cart.length;
                //update the UI
                showCartMoney(cart);
                changeCartNumber(len);
                if (len === 0){
                    displayCartNumber(false);    
                    gamesSide.innerHTML = "EMPTY";
                    totalMoney.innerHTML = "0";    
                    cartButtons.style.display = "none";
                }else{
                    cartButtons.style.display = "block";
                }
                //store the cart new values
                cart = JSON.stringify(cart);
                localStorage.setItem("cart",cart);
                //remove the game element
                elem.parentElement.remove();
            }
        }
    }else{
        elem.parentElement.remove();
    }
}

function showCartMoney(cart){
    let total = calculateTotalMoneyInCart(cart);
    totalMoney.innerHTML = total;
}

function clearCartButton(){
    let confirmation = confirm("are you sure ?");
    if (confirmation){
        clearCart();
        closeModal.click();
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
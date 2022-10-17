const totalMoney = document.getElementById("totalMoney");
const gameList = document.getElementById("gameList");
const orderForm = document.getElementById("orderForm");
const submitButton = document.getElementById("orderButton");
const spinner = document.getElementById("spinner");
const deliveryInformation = document.getElementById("deliveryInformation");

//events
window.addEventListener("storage",(ev)=>{
    //if the user tries to clear the cart value from the storage
    if (ev.key === "cart" || ev.key === null){
        onPageLoad();
    }
})
orderForm.addEventListener("submit",async (ev)=>{
    ev.preventDefault();
    //disable the submit button until the request is over
    submitButton.disabled = true;
    //show feedback that the request is ongoing
    spinnerStatus(false);
    //verify cart info
    let cart = localStorage.getItem("cart");
    if (cart){
        cart = JSON.parse(cart);
        if (cart.length === 0){
            newAlert_danger("cart is empty");
        }else{
            let status = await sendFormRequest(cart);
            statusCodeFeedBack(status);
            //clear the cart on success
            if (status === 201){
                localStorage.removeItem("cart");
                localStorage.removeItem("quantity");
                onPageLoad();
            }
        }
    }else{
        newAlert_danger("cart is empty");
    }

    //feedback that the request is done
    spinnerStatus(true);
    submitButton.disabled = false;
})

//disable the order button until the user gets the delivery infos
disableOrderButton(true); 
//functions
removeAllNegativeQuantity();
onPageLoad();
fillDeliveryInformation();
function onPageLoad(){
    let cart = localStorage.getItem("cart");
    if (cart){
        cart = JSON.parse(cart);
        showGamesAndTotalMoney(cart);
    }else{
        totalMoney.innerText = 0;
        gameList.innerHTML = `<li class="list-group-item"></li>`;
    }
}

async function fillDeliveryInformation(){
    let deliveryInfoId = getCookie("deliveryInfo");
    let url = "/api/user/getSpecificInfo?deliveryInfoId=" + encodeURIComponent(deliveryInfoId);
    let request = await fetch(url); 
    let status = request.status;
    if (status === 404){
        newAlert_danger("delivery info not found");
        return;
    }else if (status === 502){
        newAlert_danger("Bad Gateway");
        return;
    }
    
    let data = await request.json();
    
    deliveryInformation.innerHTML = `
    <b>Name:</b> ${data.FirstName} ${data.LastName}<br>
    <b>Phone:</b> ${data.TelNumber}<br>
    <b>Address:</b> ${data.Address}<br>
    <b>City:</b> ${data.City}<br>
    <b>PostalCode:</b> ${data.PostalCode}<br>`;
    disableOrderButton(false);
}

function showGamesAndTotalMoney(cart){
    //get all games quantity
    let quantity = localStorage.getItem("quantity");
    if (quantity === null){
        quantity = "{}";
    }
    let allGamesQuantity = JSON.parse(quantity);
    //get the games html ready
    gameList.innerHTML = "";
    let newList = document.createElement("ul");
    newList.classList.add("list-group");
    gameList.appendChild(newList);

    //get the total money variable ready
    let totalMoney = 0;

    for (let i = 0;i<cart.length; i++){
        let currentGameQuantity = allGamesQuantity[cart[i]["_id"]];
        currentGameQuantity = currentGameQuantity === undefined ? 1: currentGameQuantity;
        let newItem = document.createElement("li");
        newItem.classList.add("list-group-item");
        newItem.innerText = `${cart[i].title} (x${currentGameQuantity}) (${cart[i].price * currentGameQuantity}dt)`;
        newList.appendChild(newItem);
        totalMoney += cart[i].price * currentGameQuantity;
    }
    showMoney(totalMoney);
}
function showMoney(money){
    totalMoney.innerText = money;
}
function getAllGamesIDAndQuantity(cart){
    let games = {};
    let quantity = localStorage.getItem("quantity");
    if (quantity === null){
        for (let i =0; i<cart.length; i++){
            games[cart[i]["_id"]] = 1;
        }
    }else{
        quantity = JSON.parse(quantity);
        for (let i =0; i<cart.length; i++){
            let gameID = cart[i]["_id"];
            games[gameID] = quantity[gameID] === undefined ? 1: quantity[gameID];
        }
    }
    return games;
}

//send request functions
async function sendFormRequest(cart){
    //add the games ID to the form
    let games = JSON.stringify(getAllGamesIDAndQuantity(cart));
    let deliveryInfoId = getCookie("deliveryInfo");
    let orderFormData = new FormData();
    orderFormData.append("deliveryInfoId",deliveryInfoId);
    orderFormData.append("games",games);
    //send the form with the fetch api
    let URI = "/order/confirmation";
    const data = new URLSearchParams(orderFormData);
    let postRequest = await fetch(URI,{
        method:"post",
        body:data
    });
    return postRequest.status;
}
function statusCodeFeedBack(status){
    if (status === 201){
        newAlert_success("Your order has been submited");
    }else if (status === 400){
        newAlert_danger("Bad request");
    }else if (status === 404){
        newAlert_danger("delivery info not found");
        return;
    }else if (status === 502){
        newAlert_danger("Bad Gateway");
    }else{
        newAlert_danger("Unknown error");
    }
}


function spinnerStatus(hide = true){
    if (hide){
        spinner.style.display = "none";
    }else{
        spinner.style.display = "block";
    }
}

function removeAllNegativeQuantity(){
    let quantity = localStorage.getItem("quantity")
    if (quantity === null){
        return;
    }
    let allGamesQuantity = JSON.parse(quantity);
    for (let gameQ in allGamesQuantity){
        if (allGamesQuantity[gameQ] < 0 || isNaN(allGamesQuantity[gameQ]) || allGamesQuantity[gameQ] === null){
            delete allGamesQuantity[gameQ];
        }
    }
    localStorage.setItem("quantity",JSON.stringify(allGamesQuantity));
}

function disableOrderButton(bool){
    submitButton.disabled = bool;
}
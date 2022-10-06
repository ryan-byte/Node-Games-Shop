const totalMoney = document.getElementById("totalMoney");
const gameList = document.getElementById("gameList");
const orderForm = document.getElementById("orderForm");
const submitButton = document.getElementById("orderButton");
const spinner = document.getElementById("spinner");

//events
window.addEventListener("storage",(ev)=>{
    //if the user tries to clear the cart value from the storage
    if (ev.key === "cart" || ev.key === null){
        onLoad();
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
            alert("cart is empty");
            return;
        }
        let status = await sendFormRequest(cart);
        statusCodeFeedBack(status);
    }else{
        alert("cart is empty");
    }

    //feedback that the request is done
    spinnerStatus(true);
    submitButton.disabled = false;
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
function getAllGamesID(cart){
    let games = {};
    for (let i =0; i<cart.length; i++){
        games[cart[i]["_id"]] = 1;
    }
    return games;
}
async function sendFormRequest(cart){
    //add the games ID to the form
    let games = JSON.stringify(getAllGamesID(cart));
    let orderFormData = new FormData(orderForm);
    orderFormData.append("games",games);
    //send the form with the fetch api
    let URI = "/order";
    const data = new URLSearchParams(orderFormData);
    let postRequest = await fetch(URI,{
        method:"post",
        body:data
    });
    return postRequest.status;
}
function statusCodeFeedBack(status){
    if (status === 201){
        alert("Your order has been submited");
    }else if (status === 400){
        alert("Bad request");
    }else if (status === 500){
        alert("Bad Gateway");
    }else{
        alert("Unknown error");
    }
}


function spinnerStatus(hide = true){
    if (hide){
        spinner.style.display = "none";
    }else{
        spinner.style.display = "block";
    }
}
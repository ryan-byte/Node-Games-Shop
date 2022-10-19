const orderList = document.getElementById("orderList");
const getLatestOrders = document.getElementById("getLatestOrders");
const spinner = document.getElementById("spinner");
const orderInfoBody = document.getElementById("orderInfoBody");
const orderModalSpinner = document.getElementById("orderModalSpinner");

//events
getLatestOrders.addEventListener("click",async (ev)=>{
    //user feedback
    hideSpinner(false);
    disableAllApiRequestButtons(true);

    await getUserLatestOrders();

    //user feedback
    hideSpinner(true);
    disableAllApiRequestButtons(false);
});

//user feedback functions
function disableAllApiRequestButtons(bool){
    getLatestOrders.disabled = bool;
}
function hideSpinner(hide = true){
    if (hide){
        spinner.style.display = "none";
    }else{
        spinner.style.display = "block";
    }
}
function orderModal_hideSpinner(hide = true){
    if (hide){
        orderModalSpinner.style.display = "none";
    }else{
        orderModalSpinner.style.display = "block";
    }
}

//main functions
async function getUserLatestOrders(){
    let request = await fetch("/api/user/getOrders");
    let status = request.status;
    if (status === 200){
        let data = await request.json();
        showOrders(data);
    }else if (status === 429){
        newAlert_danger("Too Many Requests")
    }else if (status === 400){
        newAlert_danger("bad parameters");
    }else if (status === 502){
        newAlert_danger("bad gateway");
    }else{
        newAlert_danger("unknown error");
    }
}

//show orders functions
function showOrders(data){
    orderList.innerHTML = "";
    data.forEach(order => {
        addOrderHTML(order)
    });
}
function addOrderHTML(data){
    const viewOrderButton = createViewOrderButton(data);
    let orderStatusMessage = "";
    switch (data.verificationStatus){
        case 0:
            orderStatusMessage = "Under evaluation ⏳";
            break;
        case 1:
            orderStatusMessage = `Verified <span style="color:green;"> ✔️ </span>`
            break;
        case 2:
            orderStatusMessage = `Declined <span style="color:red;"> ❌ </span>`
            break;
        default:

            break;
    }
    const orderHTML = `
    <div class="px-2 bd-highlight border border-secondary rounded mb-2">
        <div class="row">
            <div class = "py-2 col d-flex flex-column bd-highlight">
                <div class="bd-highlight"><b>name:</b> ${data.FirstName} ${data.LastName}</div>
                <div class="bd-highlight"><b>address:</b> ${data.Address} </div>
                <div class="bd-highlight"><b>phone number:</b> ${data.TelNumber} </div>
                <div class="bd-highlight"><b>postal code:</b> ${data.PostalCode} </div>
                <div class="bd-highlight"><b>Status:</b> ${orderStatusMessage} </div>
            </div>
            <div class="p-2 col bd-highlight d-flex justify-content-center align-items-center">
                ${viewOrderButton.outerHTML}
            </div>
        </div>
    </div>`;

    orderList.insertAdjacentHTML("beforeend",orderHTML);
}
function createViewOrderButton(data){
    let viewOrderButton = document.createElement("button");
    viewOrderButton.classList.add("btn","btn-outline-primary","mx-3","orderButton");
    viewOrderButton.innerHTML = "View Order";
    viewOrderButton.dataset.data = JSON.stringify(data);
    viewOrderButton.setAttribute("onclick","updateShowOrderModal(this);");
    viewOrderButton.setAttribute("data-bs-toggle","modal");
    viewOrderButton.setAttribute("data-bs-target","#orderInfo");
    return viewOrderButton;
}

//show order modal functions
async function updateShowOrderModal(elem){
    
    //add user feedback
    orderInfoBody.innerHTML = "";
    orderModal_hideSpinner(false);
    
    //get the order infos from the dataset
    let data = elem.dataset.data;
    data = JSON.parse(data);
    let gamesIDs = Object.keys(data.Games);
    let gamesData = await getAllOrderGamesData(gamesIDs);
    if (gamesData === -1){
        newAlert_danger("an error occured");
        return;
    }
    
    let totalMoney = data.total;
    let gamesDataContainer = transfromGamesToDiv(gamesData,data.Games);
    orderInfoBody.innerHTML = `
    <div>
        <div>
            <b>Games:</b>
            ${gamesDataContainer.outerHTML}
        </div>
        <br>
        <div>
            <b>Total:</b> ${totalMoney}dt
        </div>
    </div>`;
    orderModal_hideSpinner(true);
}
async function getAllOrderGamesData(gamesIDs){
    let gameIDsString = JSON.stringify(gamesIDs);
    let encodedGamesIDs = encodeURIComponent(gameIDsString);
    if (encodedGamesIDs.length > 2000){newAlert_danger("encoded URI component length is more then 2000!!")};
    //make a request to the api to get the all games data
    let request = await fetch("/api/games/id/" + encodedGamesIDs);
    let status = request.status;
    //do something based on the request status
    if (status === 200){
        try{
            let data = await request.json();
            return data;
        }catch (err){
            if (err instanceof SyntaxError){
                newAlert_danger("bad parameters (json syntax error)")
            }
        }
    }else if (status === 400){
        newAlert_danger("Bad parameters");
    }else if (status === 429){
        newAlert_danger("Too Many Requests")
    }else if (status === 500){
        newAlert_danger("internal server error");
    }else if (status === 502){
        newAlert_danger("bad gateway");
    }else{
        newAlert_danger("unknown error");
    }
    return -1;
}
function transfromGamesToDiv(gamesData,gamesQuantity){
    let gamesContainer = document.createElement("div");
    gamesContainer.classList.add("d-flex","flex-column","bd-highlight");
    for (let i = 0; i<gamesData.length;i++){
        //get quantity
        let gameID = gamesData[i]["_id"]
        let quantity = gamesQuantity[gameID] === undefined ? 1 : gamesQuantity[gameID];
        //add the html
        let gameDiv = document.createElement("div");
        gameDiv.classList.add("bd-highlight");
        gameDiv.innerHTML = `${gamesData[i].title} (x${quantity}) (${gamesData[i].price * quantity}dt)`;
        gamesContainer.appendChild(gameDiv);
    }
    return gamesContainer;
}

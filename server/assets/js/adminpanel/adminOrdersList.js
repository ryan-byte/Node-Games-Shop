const orderList = document.getElementById("orderList");
const unverified = document.getElementById("unverified")
const verified = document.getElementById("verified")
const declined = document.getElementById("declined")
const orderInfoBody = document.getElementById("orderInfoBody");
const bootstrap_borderSize = 3;


//main function
async function getAllOrders(verificationStatus = 0){
    disableAllApiRequestButtons(true);
    hideSpinner(false);
    if (isNaN(verificationStatus)){
        alert("verification status is not a number");
        return;
    }
    let request = await fetch(`/api/orders/${verificationStatus}`);

    let status = request.status;
    if (status === 200){
        let data = await request.json();
        showOrders(verificationStatus,data);
    }else if (status === 429){
        alert("Too Many Requests")
    }else if (status === 400){
        alert("bad parameters");
    }else if (status === 502){
        alert("bad gateway");
    }else{
        alert("unknown error");
    }
    hideSpinner(true);
    disableAllApiRequestButtons(false);
}

//get orders functions
function showOrders(verificationStatus,data){
    orderList.innerHTML = "";
    if (verificationStatus === 0){
        data.forEach(order => {
            showUnverifiedOrders(order)
        });
    }else if (verificationStatus === 1){
        data.forEach(order => {
            showVerifiedOrders(order)
        });
    }else if (verificationStatus === 2){
        data.forEach(order => {
            showDeclinedOrders(order)
        });
    }
}
function showUnverifiedOrders(data){
    const viewOrderButton = createViewOrderButton(data);
    const orderHTML = `
    <div class="px-2 bd-highlight border border-secondary border-${bootstrap_borderSize} rounded mb-2">
        <div class="row">
            <div class = "py-2 col d-flex flex-column bd-highlight">
                <div class="bd-highlight"><b>name:</b> ${data.FirstName} ${data.LastName}</div>
                <div class="bd-highlight"><b>address:</b> ${data.Address} </div>
                <div class="bd-highlight"><b>phone number:</b> ${data.TelNumber} </div>
                <div class="bd-highlight"><b>postal code:</b> ${data.PostalCode} </div>
            </div>
            <div class="p-2 col bd-highlight d-flex justify-content-center align-items-center">
                <button type="button" class="btn btn-outline-success mx-3 orderButton" data-id = "${data["_id"]}" onclick = "verifyOrder(this)">Verify</button>
                ${viewOrderButton.outerHTML}
                <button type="button" class="btn btn-outline-danger mx-3 orderButton" data-id = "${data["_id"]}" onclick = "declineOrder(this)">Decline</button>
            </div>
        </div>
    </div>`;

    orderList.insertAdjacentHTML("beforeend",orderHTML);
}
function showVerifiedOrders(data){
    const viewOrderButton = createViewOrderButton(data);
    const orderHTML = `
    <div class="px-2 bd-highlight border border-success border-${bootstrap_borderSize} rounded mb-2">
        <div class="row">
            <div class = "py-2 col d-flex flex-column bd-highlight">
                <div class="bd-highlight"><b>name:</b> ${data.FirstName} ${data.LastName}</div>
                <div class="bd-highlight"><b>address:</b> ${data.Address} </div>
                <div class="bd-highlight"><b>phone number:</b> ${data.TelNumber} </div>
                <div class="bd-highlight"><b>postal code:</b> ${data.PostalCode} </div>
            </div>
            <div class="p-2 col bd-highlight d-flex justify-content-center align-items-center">
                ${viewOrderButton.outerHTML}
            </div>
        </div>
    </div>`;

    orderList.insertAdjacentHTML("beforeend",orderHTML);
}
function showDeclinedOrders(data){
    const viewOrderButton = createViewOrderButton(data);
    const orderHTML = `
    <div class="px-2 bd-highlight border border-danger border-${bootstrap_borderSize} rounded mb-2">
        <div class="row">
            <div class = "py-2 col d-flex flex-column bd-highlight">
                <div class="bd-highlight"><b>name:</b> ${data.FirstName} ${data.LastName}</div>
                <div class="bd-highlight"><b>address:</b> ${data.Address} </div>
                <div class="bd-highlight"><b>phone number:</b> ${data.TelNumber} </div>
                <div class="bd-highlight"><b>postal code:</b> ${data.PostalCode} </div>
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

//show order functions
async function updateShowOrderModal(elem){
    //get the order infos from the dataset
    let data = elem.dataset.data;
    data = JSON.parse(data);
    
    let gamesData = await getAllOrderGamesData(data.GameIDs);
    if (gamesData === -1){
        alert("an error occured");
        return;
    }
    
    let totalMoney = getTotalMoney(gamesData);
    let gamesDataContainer = transfromGamesToDiv(gamesData)
    orderInfoBody.innerHTML = `
    <div>
        <div>
            <b>Name: </b> ${data.FirstName} ${data.LastName}<br>
            <b>Phone Number: </b>+216 ${data.TelNumber} <br>
            <b>Address: </b> ${data.Address} <br>
            <b>Postal Code: </b> ${data.PostalCode} <br>
        </div>
        <br>
        <div>
            <b>Games:</b>
            ${gamesDataContainer.outerHTML}
        </div>
        <br>
        <div>
            <b>Total:</b> ${totalMoney}dt
        </div>
    </div>`
}
async function getAllOrderGamesData(gamesIDs){
    let gameIDsString = JSON.stringify(gamesIDs);
    let encodedGamesIDs = encodeURIComponent(gameIDsString);
    if (encodedGamesIDs.length > 2000){alert("encoded URI component length is more then 2000!!")};
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
                alert("bad parameters (json syntax error)")
            }
        }
    }else if (status === 400){
        alert("Bad parameters");
    }else if (status === 429){
        alert("Too Many Requests")
    }else if (status === 500){
        alert("internal server error");
    }else if (status === 502){
        alert("bad gateway");
    }else{
        alert("unknown error");
    }
    return -1;
}
function transfromGamesToDiv(gamesDataArray){
    let gamesContainer = document.createElement("div");
    gamesContainer.classList.add("d-flex","flex-column","bd-highlight");
    gamesDataArray.forEach(gameData => {
        let gameDiv = document.createElement("div");
        gameDiv.classList.add("bd-highlight");
        gameDiv.innerHTML = `${gameData.title} (${gameData.price}dt)`;
        gamesContainer.appendChild(gameDiv);
    });
    return gamesContainer;
}
function getTotalMoney(gamesDataArray){
    let total = 0;
    gamesDataArray.forEach(gameData => {
        total += gameData.price;
    });
    return total;
}

//verify |decline functions
async function verifyOrder(elem){

    let confirmation = confirm("are you sure ?");
    if (!confirmation){
        return;
    }

    //verify order api
    const orderID = elem.dataset.id;
    let request = await fetch(`/api/verifyOrder/${orderID}`,{
        method:"put"
    })
    let status = request.status; 
    if (status === 200){
        //remove order
        elem.parentElement.parentElement.parentElement.remove();
        alert("order has been verified");
    }else if (status === 400){
        alert("bad parameters cannot verify order");
    }else if (status === 404){
        alert("order Not Found");        
    }else if (status === 502){
        alert("internal server error cannot verify order");        
    }else{
        alert("unknown error cannot verify order");        
    }
}
async function declineOrder(elem){
    let confirmation = confirm("are you sure ?");
    if (!confirmation){
        return;
    }

    //decline order api
    const orderID = elem.dataset.id;
    let request = await fetch(`/api/declineOrder/${orderID}`,{
        method:"put"
    })
    let status = request.status; 
    if (status === 200){
        //remove order
        elem.parentElement.parentElement.parentElement.remove();
        alert("order has been verified");
    }else if (status === 400){
        alert("bad parameters cannot verify order");
    }else if (status === 404){
        alert("order Not Found");        
    }else if (status === 502){
        alert("internal server error cannot verify order");        
    }else{
        alert("unknown error cannot verify order");        
    }
}

//user feedback functions
function disableAllApiRequestButtons(bool){
    unverified.disabled = bool;
    verified.disabled = bool;
    declined.disabled = bool;
}
function hideSpinner(hide = true){
    if (hide){
        spinner.style.display = "none";
    }else{
        spinner.style.display = "block";
    }
}
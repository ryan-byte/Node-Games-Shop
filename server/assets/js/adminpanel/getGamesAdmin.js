const searchButton = document.getElementById("search");
const itemContainer = document.getElementById("itemContainer");
const titleInput = document.getElementById("title");
const salesTableBody = document.getElementById("salesTableBody");
const totalMoneyElem = document.getElementById("totalSalesMoney")
const button = document.getElementById("spinner");
const salesHistoryModalSpinner = document.getElementById("spinner_salesHistory");

getAllgames();
//main function
async function getAllgames(title = ""){
    try{
        spinnerStatus(false);
        disableSearchButton(true);
        const request = await fetch(`/api/games/${title}`);
        getGames_statusCodeOutput(request.status);
        const jsonData = await request.json();
        showGames(jsonData);
    }catch (err){
        if (! err instanceof SyntaxError){
            newAlert_danger("unknown error");
            console.error(err);
        }
    }
    disableSearchButton(false);
}

//show games functions
function getGames_statusCodeOutput(statusCode){
    if (statusCode === 502){
        spinnerStatus(true);
        itemContainer.innerHTML = "Bad Gateway";
    }else if (statusCode === 429){
        newAlert_danger("Too Many Requests")
    }else if (statusCode === 204){
        spinnerStatus(true);
        itemContainer.innerHTML = "No Content";
    }
}
function showGames(gamesData){
    spinnerStatus(true);
    itemContainer.innerHTML = `
    <thead>
        <tr>  
            <th scope="col" colspan="4">Title</th>
            <th scope="col" colspan="4">Type</th>
            <th scope="col" colspan="4">Price</th>   
            <th scope="col" colspan="4">Stock</th>
            <th scope="col" colspan="1">Update</th>   
            <th scope="col" colspan="1">Delete</th>   
            <th scope="col" colspan="1">Sales History</th>   
                                
        </tr>
    </thead>
    <tbody></tbody>`;
    let itemContainerTBody = itemContainer.getElementsByTagName("tbody")[0];
    gamesData.forEach(data => {
        let tr = document.createElement("tr");
        adminpanel_renderGame(tr,data);
        itemContainerTBody.appendChild(tr);
    });
}
function adminpanel_renderGame(tr,data){
    tr.dataset.objectId = data["_id"];
    tr.dataset.title = data.title;
    tr.dataset.type = data.type;
    tr.dataset.stock = data.stock;
    tr.dataset.price = data.price;
    tr.innerHTML = `
    <td colspan="4" scope="row">${data.title}</td>
    <td colspan="4">${data.type}</td>
    <td colspan="4">${data.price}</td>
    <td colspan="4">${data.stock}</td>
    <td colspan="1">
        <span class = "linkButton" onclick="fillUpdateForm(this)" data-bs-toggle="modal" data-bs-target="#staticBackdrop">
            Update
        </span>
    </td>
    <td colspan="1">
        <span class = "linkButton" onclick="deleteGame(this)">
            Delete
        </span>
    </td>
    <td colspan="1">
        <span data-id="${data["_id"]}" class = "linkButton" onclick="fillSalesHistoryModal(this)" data-bs-toggle="modal" data-bs-target="#salesHistory">
            Sales
        </span>
    </td>
    `;
}
function spinnerStatus(hide = true){
    if (hide){
        button.style.display = "none";
    }else{
        button.style.display = "block";
    }
}

//utils functions
function disableSearchButton (bool){
    searchButton.disabled = bool;
}

//events
titleInput.addEventListener("keypress",(ev)=>{
    if (ev.key === "Enter"){
        searchButton.click();
    }
})
searchButton.addEventListener("click",(ev)=>{
    getAllgames(titleInput.value);
})


//fill Sales history modal
async function fillSalesHistoryModal(elem){
    //show a feedback to the user that the request is loading
    show_spinnerstatus_salesHistoryModal(true);
    //make a request to get all the product sales history
    let gameID = elem.dataset.id;
    let data = await requestSalesHistory(gameID);
    //update the html
    updateSalesHistoryHTML(data);
    //user feedback
    show_spinnerstatus_salesHistoryModal(false);
}
async function requestSalesHistory(gameID){
    const request = await fetch(`/api/games/sales/history/${gameID}`);
    const data = await request.json();
    return data;
}
function updateSalesHistoryHTML(data){
    salesTableBody.innerHTML = "";

    let totalGamesMoney = 0;
    data.forEach(saleData => {
        let tr = document.createElement("tr");
        let date = new Date(saleData.timeStamp * 1000);
        tr.innerHTML = `
        <td colspan="4">${saleData.unitPrice}DT</td>
        <td colspan="4">${saleData.quantity}</td>
        <td colspan="4">${saleData.total}DT</td>
        <td colspan="4">${date.toLocaleDateString("en-GB")}</td>
        `;
        salesTableBody.append(tr);

        totalGamesMoney += saleData.total;
    });
    totalMoneyElem.innerText = `${totalGamesMoney}DT`;
}

function show_spinnerstatus_salesHistoryModal(show = true){
    if (show){
        salesHistoryModalSpinner.style.display = "block";
    }else{
        salesHistoryModalSpinner.style.display = "none";
    }
}
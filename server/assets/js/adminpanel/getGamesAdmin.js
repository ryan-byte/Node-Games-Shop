const searchButton = document.getElementById("search");
const itemContainer = document.getElementById("itemContainer");
const titleInput = document.getElementById("title");
const spinner = document.getElementById("spinner");



const limit = 20;
let currentLogDoc = 0;
let totalLogsDocs = 0;
let canLoad = true;

//detect when the user reached the bottom of the page
window.onscroll = function(ev) {
    if ((window.innerHeight + window.scrollY) >= document.body.offsetHeight) {
        if (canLoad){
            if (currentLogDoc < totalLogsDocs){
                currentLogDoc += limit;
                getAllgames(titleInput.value,currentLogDoc);
            }
        }
    }
};
//events
titleInput.addEventListener("keypress",(ev)=>{
    if (ev.key === "Enter"){
        searchButton.click();
    }
})
searchButton.addEventListener("click",(ev)=>{
    itemContainer.innerHTML = "";
    currentLogDoc = 0;
    getAllgames(titleInput.value,currentLogDoc);
})
searchButton.click();



//main function
async function getAllgames(title = "",start){
    canLoad = false;
    spinnerStatus(false);
    disableSearchButton(true);
    try{
        spinnerStatus(false);
        disableSearchButton(true);
        const request = await fetch(`/api/games/${title}?start=${start}&limit=${limit}`);
        getGames_statusCodeOutput(request.status);
        const jsonData = await request.json();
        totalLogsDocs = jsonData.counts;
        showGames(jsonData.data);
    }catch (err){
        if (! err instanceof SyntaxError){
            newAlert_danger("unknown error");
            console.error(err);
        }
    }
    disableSearchButton(false);
    spinnerStatus(true);
    canLoad =true;
}

//show games functions
function getGames_statusCodeOutput(statusCode){
    if (statusCode === 502){
        itemContainer.innerHTML = "Bad Gateway";
    }else if (statusCode === 429){
        newAlert_danger("Too Many Requests")
    }else if (statusCode === 204){
        itemContainer.innerHTML = "No Content";
    }
}
function showGames(gamesData){
    gamesData.forEach(data => {
        let tr = document.createElement("tr");
        adminpanel_renderGame(tr,data);
        itemContainer.appendChild(tr);
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

//utils functions
function spinnerStatus(hide = true){
    if (hide){
        spinner.style.display = "none";
    }else{
        spinner.style.display = "block";
    }
}
function disableSearchButton (bool){
    searchButton.disabled = bool;
}

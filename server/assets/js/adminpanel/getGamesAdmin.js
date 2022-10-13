const searchButton = document.getElementById("search");
const itemContainer = document.getElementById("itemContainer");
const titleInput = document.getElementById("title");

//main function
async function getAllgames(title = ""){
    try{
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
            <th scope="col" colspan="4">title</th>
            <th scope="col" colspan="4">type</th>
            <th scope="col" colspan="4">price</th>
            <th scope="col" colspan="4">stock</th>   
            <th scope="col" colspan="1">update</th>   
            <th scope="col" colspan="1">delete</th>   
                                
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
    <td colspan="4">${data.stock}</td>
    <td colspan="4">${data.price}</td>
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
    `;
}
function spinnerStatus(hide = true){
    const button = document.getElementById("spinner");
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
    spinnerStatus(false);
    getAllgames(titleInput.value);
})
const searchButton = document.getElementById("search");
const itemContainer = document.getElementById("itemContainer");
const titleInput = document.getElementById("title");
const spinner = document.getElementById("spinner");


getAllgames();
//main function
async function getAllgames(title = ""){
    spinnerStatus(false);
    disableSearchButton(true);
    try{
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
    spinnerStatus(true);
}

//show games functions
function getGames_statusCodeOutput(statusCode){
    if (statusCode === 502){
        itemContainer.innerHTML = "Bad Gateway";
    }else if (statusCode === 204){
        itemContainer.innerHTML = "No Content";
    }
}
function showGames(gamesData){
    itemContainer.innerHTML = "";
    gamesData.forEach(data => {
        let div = document.createElement("div");
        div.classList.add("gameItem");
        div.classList.add("m-2");
        renderGame(div,data);
        itemContainer.appendChild(div)
    });
}
function renderGame(div,data){
    div.dataset.title = data.title;
    div.dataset.type = data.type;
    div.dataset.stock = data.stock;
    div.dataset.price = data.price;
    div.dataset.allData = JSON.stringify(data);
    div.innerHTML = `
    <div class="gameImage" style="background-image:url('${data.imageURL}');"></div>
    <div class="title">
        <b> ${data.title} </b>
    </div>
    <div class="info" >
        <h3 class="price"><b> ${data.price}DT </b></h3>
        <h5 style="color: ${data.stock>0 ? "rgb(0,255,0)":"rgb(255,0,0)"};"><b> ${data.stock>0 ? "In stock":"Out of stock"} </b></h5>
        <button type="button" class="btn btn-warning" onclick="storeGameInCart(this.parentElement.parentElement.dataset.allData)">add to cart</button>
    </div>
    `;
}


//utils functions
function disableSearchButton (bool){
    searchButton.disabled = bool;
}
function spinnerStatus(hide = true){
    if (hide){
        spinner.style.display = "none";
    }else{
        spinner.style.display = "block";
    }
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

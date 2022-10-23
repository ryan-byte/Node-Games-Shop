const searchButton = document.getElementById("search");
const itemContainer = document.getElementById("itemContainer");
const titleInput = document.getElementById("title");
const spinner = document.getElementById("spinner");

const limit = 12;
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
        newAlert_danger("Bad Gateway");
    }else if (statusCode === 400){
        newAlert_danger("Bad request");
    }else if (statusCode === 204){
        itemContainer.innerHTML = "No Content";
    }
}
function showGames(gamesData){
    gamesData.forEach(data => {
        let div = document.createElement("div");
        div.classList.add("m-2","gameItemHeight","gameItemWidth");
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
    <div class="card gameItemHeight">
        <div class = " border gameItemWidth gameImageHolderHeight">
            <img class = "gameItemWidth gameImageMaxHeight"  src="${data.imageURL}" class="card-img-top" alt="${data.title} image">
        </div>
        <div class="card-body position-relative">
            <h6 class="card-title text-center">${data.title}</h6>
            <div class = "position-absolute bottom-0 start-50 translate-middle-x text-center" style = "width:100%">
                <b> ${data.price}DT </b>
                <p class="card-title" style="color: ${data.stock>0 ? "rgb(0,255,0)":"rgb(255,0,0)"};"><b> ${data.stock>0 ? "In stock":"Out of stock"} </b></p>
                <button type="button" class="btn btn-warning" onclick="storeGameInCart(this.parentElement.parentElement.parentElement.parentElement.dataset.allData)">add to cart</button>
            </div>
        </div>
    </div>`;
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


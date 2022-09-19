const searchButton = document.getElementById("search");
const itemContainer = document.getElementById("itemContainer");
const titleInput = document.getElementById("title");
const updateForm = document.getElementById("updateForm");
const updateFormClose = document.getElementById("updateFormClose");

//update form inputs
const input_updateTitle = document.getElementById("updateTitle");
const input_updateType = document.getElementById("updateType");
const input_updatePrice = document.getElementById("updatePrice");
const input_updateStock = document.getElementById("updateStock");


titleInput.addEventListener("keypress",(ev)=>{
    if (ev.key === "Enter"){
        searchButton.click();
    }
})
searchButton.addEventListener("click",(ev)=>{
    spinnerStatus(false);
    getAllgames(titleInput.value);
})

async function getAllgames(title = ""){
    const request = await fetch(`/api/games/${title}`);
    if (request.status === 502){
        spinnerStatus(true);
        itemContainer.innerHTML = "Bad Gateway";
        return;
    }else if (request.status === 204){
        spinnerStatus(true);
        itemContainer.innerHTML = "No Content";
        return;
    }
    const jsonData = await request.json();
    spinnerStatus(true);
    itemContainer.innerHTML = "";
    jsonData.forEach(data => {
        let div = document.createElement("div");
        div.classList.add("border");
        div.classList.add("w-25");
        div.classList.add("p-3");
        renderGame(div,data);
        itemContainer.appendChild(div);
    });
}
function spinnerStatus(hide = true){
    const button = document.getElementById("spinner");
    if (hide){
        button.style.display = "none";
    }else{
        button.style.display = "block";
    }
}


async function deleteGame(elem){
    //confirm alert function
    let confirmation = confirm("Are you sure?");
    if (confirmation){
        //get the object id
        let gameElem = elem.parentElement;
        let objectId = gameElem.dataset.objectId;
        //call the delete api 
        let request = await fetch(`/api/games/${objectId}`,{
            method:"DELETE"
        })
        //wait for a response then depending on the status code show an alert
        if (request.status === 200){
            //delete the elem
            gameElem.remove();
        }else if (request.status === 400){
            alert("Bad Request");
        }else if (request.status === 404){
            alert("Not Found");
        }else if (request.status === 401){
            alert("unauthorized (reload the page)")
        }else{
            alert("unknown error");
        }

    }
}


function fillUpdateForm(elem){
    //get the object id
    console.log("test");
    let gameElem = elem.parentElement;
    let gameDataSet = gameElem.dataset;
    //fill the form
    updateForm.dataset.objectId = gameDataSet.objectId;
    input_updateTitle.placeholder = gameDataSet.title;
    input_updateType.placeholder = gameDataSet.type;
    input_updateStock.placeholder = gameDataSet.stock;
    input_updatePrice.placeholder = gameDataSet.price;
    input_updateTitle.value = "";
    input_updateType.value = "";
    input_updateStock.value = "";
    input_updatePrice.value = "";
}
async function updateGame(){
    //confirm
    let confirmation = confirm("are you sure?")
    if (confirmation){
        //get all the data ready for the api
        let objectId = updateForm.dataset.objectId;
        let title = input_updateTitle.value === "" ? input_updateTitle.placeholder : input_updateTitle.value;
        let type = input_updateType.value === "" ? input_updateType.placeholder : input_updateType.value;
        let stock = input_updateStock.value === "" ? input_updateStock.placeholder : input_updateStock.value;
        let price = input_updatePrice.value === "" ? input_updatePrice.placeholder : input_updatePrice.value;
        
        //procceed with the api
        let apiURI = encodeURI(`/api/games/${objectId}?title=${title}&type=${type}&stock=${stock}&price=${price}`);
        let request = await fetch(apiURI,{
            method:"PUT"
        })
        //do something depending on the status code
        if (request.status === 200){
            //change the game values
            let gameElem = document.querySelector(`div[data-object-id='${objectId}']`)
            let data = {"_id":objectId,
                        title,
                        type,
                        stock:parseInt(stock),
                        price:parseInt(price)};
            renderGame(gameElem,data);
            //close the form
            updateFormClose.click();
        }else if (request.status === 400){
            alert("Bad parameters");
        }else if (request.status === 401){
            alert("unauthorized (reload the page)")
        }else{
            alert("unknown error (try reloading the page)");
        }
    }
}


function renderGame(div,data){
    div.dataset.objectId = data["_id"];
    div.dataset.title = data.title;
    div.dataset.type = data.type;
    div.dataset.stock = data.stock;
    div.dataset.price = data.price;
    div.innerHTML = `
    <b>Title:</b> ${data.title}<br>
    <b>Type:</b> ${data.type}<br>
    <b>Price:</b> ${data.price}DT<br>
    <b>Stock:</b> ${data.stock}<br>
    <button type="button" class="btn btn-danger" onclick="deleteGame(this)">Delete</button>
    <button type="button" class="btn btn-warning" onclick="fillUpdateForm(this)" data-bs-toggle="modal" data-bs-target="#staticBackdrop">Update</button>
    `;
}
const updateForm = document.getElementById("updateForm");
const updateFormClose = document.getElementById("updateFormClose");

const input_updateTitle = document.getElementById("updateTitle");
const input_updateType = document.getElementById("updateType");
const input_updatePrice = document.getElementById("updatePrice");
const input_updateStock = document.getElementById("updateStock");
const input_imageFileUpload = document.getElementById("imageFileUpload");




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
        let statusCode = await updateGameApi(objectId,title,type,stock,price);
        //do something depending on the status code
        updateGame_statusCode(statusCode,title,type,stock,price,objectId)
    }
}
async function updateGameApi(objectId,title,type,stock,price){
    let imageFile = input_imageFileUpload.files[0];
    let formData = new FormData()
    if (imageFile !== undefined){
        formData.append("imageFileUpload",imageFile,"imageFileUpload");
    }
    let apiURI = encodeURI(`/api/games/${objectId}?title=${title}&type=${type}&stock=${stock}&price=${price}`);
    let request = await fetch(apiURI,{
        method:"PUT",
        body:formData
    });
    return request.status;
}

function updateGame_statusCode(statusCode,title,type,stock,price,objectId){
    if (statusCode === 200){
        //change the game values
        let gameElem = document.querySelector(`div[data-object-id='${objectId}']`)
        let data = {"_id":objectId,
                    title,
                    type,
                    stock:parseInt(stock),
                    price:parseInt(price)};
        adminPanel_renderGame(gameElem,data);
        //close the form
        updateFormClose.click();
    }else if (statusCode === 400){
        alert("Bad parameters");
    }else if (statusCode === 401){
        alert("unauthorized (reload the page)")
    }else if (statusCode === 415){
        alert("uploading image failed must be (jpeg/jng)")
    }else if (statusCode === 413){
        alert("file size is too large")
    }else if (statusCode === 502){
        alert("Bad Gateway");
    }else{
        alert("unknown error (try reloading the page)");
    }
}

function fillUpdateForm(elem){
    //get the object id
    let gameElem = elem.parentElement.parentElement.parentElement;
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
    input_imageFileUpload.value = "";
}
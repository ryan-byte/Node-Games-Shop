const addGameForm = document.getElementById("addGameForm");
const input_newGameTitle = document.getElementById("newGameTitle");
const input_newGameType = document.getElementById("newGameType");
const input_newGamePrice = document.getElementById("newGamePrice");
const input_newGameStock = document.getElementById("newGameStock");
const input_imageFileUpload = document.getElementById("imageFileUpload");
const spinner = document.getElementById("spinner");
const addButton = document.getElementById("addButton");

const validationError = document.getElementById("validationError");


addGameForm.addEventListener("submit",async (ev)=>{
    ev.preventDefault();
    //feedback
    spinnerStatus(false);
    disableAddButton(true);
    //Get all form data
    let title = input_newGameTitle.value;
    let type = input_newGameType.value;
    let price = input_newGamePrice.value;
    let stock = input_newGameStock.value;
    //verify the values
    addGame_input_verification(price,stock);
    //confirm from the user
    let confirmation = confirm("are you sure ?")
    if (confirmation){
        //procceed to the api
        let imageFile = input_imageFileUpload.files[0];
        let statusCode = await addGameAPI(title,type,price,stock,imageFile);
        //show an output based on the status code
        addGame_statusCodeOutput(statusCode)
    }
    //feedback
    spinnerStatus(true);
    disableAddButton(false);
})

function addGame_input_verification(price,stock){
    price = parseInt(price);
    stock = parseInt(stock);
    if (isNaN(price)){
        validationError.style.display = "block";
        validationError.innerHTML = "Price must be a number.";
        return;
    }else if (isNaN(stock)){
        validationError.style.display = "block";
        validationError.innerHTML = "Stock must be a number.";
        return;
    }else{
        validationError.style.display = "none";
        validationError.innerHTML = "";
    }
}
async function addGameAPI(title,type,price,stock,imageFile){
    let formData = new FormData()
    formData.append("imageFileUpload",imageFile,"imageFileUpload");
    let createGameURI = encodeURI(`/api/games?title=${title}&type=${type}&price=${price}&stock=${stock}`);
    let request = await fetch(createGameURI,{
        method:"POST",
        body:formData
    });
    return request.status;
}
function addGame_statusCodeOutput(statusCode){
    if (statusCode === 201){
        newAlert_success("Game added successfully");
        input_newGameTitle.value = "";
        input_newGamePrice.value  = "";
        input_newGameType.value = "";
        input_newGameStock.value  = "";
        input_imageFileUpload.value = "";
    }else if (statusCode === 415){
        newAlert_danger("uploading image failed must be (jpeg/jng)")
    }else if (statusCode === 413){
        newAlert_danger("file size is too large")
    }else if (statusCode === 400){
        newAlert_danger("Bad parameters");
    }else if (statusCode === 502){
        newAlert_danger("Bad Gateway");
    }else if (statusCode === 401){
        newAlert_danger("unauthorized (reload the page)");
    }else{
        newAlert_danger("unknown error");
    }
}

//utils functions
function spinnerStatus(hide = true){
    if (hide){
        spinner.style.display = "none";
    }else{
        spinner.style.display = "block";
    }
}
function disableAddButton (bool){
    addButton.disabled = bool;
}

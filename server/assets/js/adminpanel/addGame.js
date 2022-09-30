const addGameForm = document.getElementById("addGameForm");
const input_newGameTitle = document.getElementById("newGameTitle");
const input_newGameType = document.getElementById("newGameType");
const input_newGamePrice = document.getElementById("newGamePrice");
const input_newGameStock = document.getElementById("newGameStock");
const input_imageFileUpload = document.getElementById("imageFileUpload");

const validationError = document.getElementById("validationError");


addGameForm.addEventListener("submit",async (ev)=>{
    ev.preventDefault();
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
        alert("Game added successfully");
        input_newGameTitle.value = "";
        input_newGamePrice.value  = "";
        input_newGameType.value = "";
        input_newGameStock.value  = "";
    }else if (statusCode === 415){
        alert("uploading image failed must be (jpeg/jng)")
    }else if (statusCode === 413){
        alert("file size is too large")
    }else if (statusCode === 400){
        alert("Bad parameters");
    }else if (statusCode === 502){
        alert("Bad Gateway");
    }else if (statusCode === 401){
        alert("unauthorized (reload the page)");
    }else{
        alert("unknown error");
    }
}
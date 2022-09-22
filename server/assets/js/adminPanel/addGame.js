const addGameForm = document.getElementById("addGameForm");
const input_newGameTitle = document.getElementById("newGameTitle");
const input_newGameType = document.getElementById("newGameType");
const input_newGamePrice = document.getElementById("newGamePrice");
const input_newGameStock = document.getElementById("newGameStock");

const validationError = document.getElementById("validationError");


addGameForm.addEventListener("submit",async (ev)=>{
    ev.preventDefault();
    //Get all form data
    let title = input_newGameTitle.value;
    let type = input_newGameType.value;
    let price = input_newGamePrice.value;
    let stock = input_newGameStock.value;
    //verify the values
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
    //confirm from the user
    let confirmation = confirm("are you sure ?")
    if (confirmation){
        //procceed to the api
        let createGameURI = encodeURI(`/api/games?title=${title}&type=${type}&price=${price}&stock=${stock}`);
        let request = await fetch(createGameURI,{
            method:"POST"
        });
        //show an output based on the status code
        if (request.status === 201){
            alert("Game added successfully");
            input_newGameTitle.value = "";
            input_newGamePrice.value  = "";
            input_newGameType.value = "";
            input_newGameStock.value  = "";
        }else if (request.status === 400){
            alert("Bad parameters");
        }else if (request.status === 502){
            alert("Bad Gateway");
        }else if (request.status === 401){
            alert("unauthorized (reload the page)");
        }else{
            alert("unknown error");
        }
    }

})
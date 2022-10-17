const addInfoForm = document.getElementById("addInfoForm");
const spinner = document.getElementById("spinner");
const addInfoButton = document.getElementById("addInfoButton");


//main event
addInfoForm.addEventListener("submit",async (ev)=>{
    ev.preventDefault();
    //feedback
    spinnerStatus(false);
    disable_buttons(true);
    //send request
    let status = await sendInfoFormRequest();
    //feedback
    statusCodeFeedBack(status);
    spinnerStatus(true);
    disable_buttons(false);
    //redirect 
    if (status === 201){
        window.location.replace("/order/information");
    }
})


//functions to achieve the main event
async function sendInfoFormRequest(){
    //get the form info
    let orderFormData = new FormData(addInfoForm);
    //send info data
    let URI = "/order/information/add";
    const data = new URLSearchParams(orderFormData);
    let postRequest = await fetch(URI,{
        method:"post",
        body:data
    });
    return postRequest.status;
}


//feedback functions
function statusCodeFeedBack(status){
    if (status === 201){
        newAlert_success("Your information has been submited");
    }else if (status === 400){
        newAlert_danger("Bad request");
    }else if (status === 502){
        newAlert_danger("Bad Gateway");
    }else{
        newAlert_danger("Unknown error");
    }
}
function spinnerStatus(hide = true){
    if (hide){
        spinner.style.display = "none";
    }else{
        spinner.style.display = "block";
    }
}
function disable_buttons(bool){
    addInfoButton.disabled = bool;
}
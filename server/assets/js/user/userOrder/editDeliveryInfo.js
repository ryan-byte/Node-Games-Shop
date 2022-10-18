const editInfoForm = document.getElementById("editInfoForm");
const spinner = document.getElementById("spinner");
const editInfoButton = document.getElementById("editInfoButton");
const FirstName = document.getElementById("FirstName");
const LastName = document.getElementById("LastName");
const TelNumber = document.getElementById("TelNumber");
const Address = document.getElementById("Address");
const City = document.getElementById("City");
const PostalCode = document.getElementById("PostalCode");

let deliveryCookieValue = getCookie("deliveryInfo");

updateDeliveryInfoInputValues();
//update the inputs value on loadup
async function updateDeliveryInfoInputValues(){
    //get delivery info values
    let url = "/api/user/getSpecificInfo?deliveryInfoId=" + encodeURIComponent(deliveryCookieValue);
    let request = await fetch(url);
    let status = request.status;
    if (status === 404){
        newAlert_danger("Delivery Info Not Found (you must select delivery info again)");
        return;
    }else if (status === 502){
        newAlert_danger("Bad Gateway");
        return;
    }
    
    let data = await request.json();
    FirstName.value = data.FirstName;
    LastName.value = data.LastName;
    TelNumber.value = data.TelNumber;
    Address.value = data.Address;
    City.value = data.City;
    PostalCode.value = data.PostalCode;
}

//main event
editInfoForm.addEventListener("submit",async (ev)=>{
    ev.preventDefault();
    //feedback
    spinnerStatus(false);
    disable_buttons(true);
    //send request
    let status = await sendEditInfoFormRequest();
    //feedback
    statusCodeFeedBack(status);
    spinnerStatus(true);
    disable_buttons(false);
    //redirect 
    if (status === 201){
        window.location.replace("/order/information");
    }
})
//update values request
async function sendEditInfoFormRequest(){
    //get the form info
    let orderFormData = new FormData(editInfoForm);
    orderFormData.append("deliveryInfoId",deliveryCookieValue);
    console.log(orderFormData);
    //send info data
    let URI = "/order/information/edit";
    const data = new URLSearchParams(orderFormData);
    let postRequest = await fetch(URI,{
        method:"put",
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
    }else if (status === 404){
        newAlert_danger("Delivery Info Not Found (you must select delivery info again)");
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
    editInfoButton.disabled = bool;
}
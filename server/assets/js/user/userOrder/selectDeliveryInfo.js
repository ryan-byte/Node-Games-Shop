const infoContainer = document.getElementById("infoContainer");
const next = document.getElementById("next");
const edit = document.getElementById("edit");
const spinner = document.getElementById("spinner");


let selectedElement = "";

disableSelectButtons(true);
showInformations();

//show info functions
async function showInformations(){
    spinnerStatus(false);
    let url = "/api/user/getInfos";
    let request = await fetch(url);
    
    let data = await request.json(); 
    //if the data is empty dont empty the list
    if (data.length !== 0){
        infoContainer.innerHTML = "";
        data.forEach(info => {
            renderInfo(info);
        });
    }
    spinnerStatus(true);
}
function renderInfo(data){
    const infoItem = document.createElement("li");
    infoItem.classList.add("list-group-item","list-group-item-action","infoItem");
    infoItem.setAttribute("onclick","selectInfo(this)");
    infoItem.dataset.id = data._id;
    infoItem.innerHTML = `
    <b>Name:</b> ${data.FirstName} ${data.LastName}<br>
    <b>Phone:</b> ${data.TelNumber}<br>
    <b>Address:</b> ${data.Address}<br>
    <b>City:</b> ${data.City}<br>
    <b>PostalCode:</b> ${data.PostalCode}<br>`;
    infoContainer.append(infoItem);
}
function statusCodeFeedBack(status){
    if (status === 201){
        newAlert_success("Your information has been submited");
    }else if (status === 502){
        newAlert_danger("Bad Gateway");
    }else{
        newAlert_danger("Unknown error");
    }
}

//select info functions
function selectInfo(element){
    //desactive the current active element
    desactiveChilds(element.parentElement);
    //activate this element
    element.classList.add("active");
    element.setAttribute("aria-current","true");
    selectedElement = element;
    disableSelectButtons(false);
}

//next button functions
next.addEventListener("click",async (ev)=>{
    disableSelectButtons(true);
    spinnerStatus(false);
    if (selectedElement === ""){
        return;
    }
    let deliveryInfoId = selectedElement.dataset.id;
    await selectRequest(deliveryInfoId,"/order/confirmation")
    disableSelectButtons(false);
    spinnerStatus(true);
})

//edit button functions
edit.addEventListener("click",async (ev)=>{
    disableSelectButtons(true);
    spinnerStatus(false);
    if (selectedElement === ""){
        return;
    }
    let deliveryInfoId = selectedElement.dataset.id;
    await selectRequest(deliveryInfoId,"/order/information/edit")
    disableSelectButtons(false);
    spinnerStatus(true);
})



async function selectRequest(deliveryInfoId,redirectURL){
    let data = "deliveryInfoId=" +deliveryInfoId; 
    let request = await fetch("/order/information/select",{
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        method:"post",
        body:data
    });
    let status = request.status;
    statusFeedback(status);
    if (status === 200){
        window.location.replace(redirectURL);
    }
}

//user feedback
function statusFeedback(status){
    if (status === 404){
        newAlert_danger("Delivery info Not Found (reload the page)");
    }else if (status === 502){
        newAlert_danger("Bad Gateway");
    }
}
function spinnerStatus(hide = true){
    if (hide){
        spinner.style.display = "none";
    }else{
        spinner.style.display = "block";
    }
}

function desactiveChilds(parent){
    let currentActive = parent.querySelectorAll("[aria-current=true]");
    for (let i = 0; i<currentActive.length; i++){
        currentActive[i].classList.remove("active");
        currentActive[i].removeAttribute("aria-current");
    }
}
function disableSelectButtons(bool){
    if (bool){
        next.classList.add("disabled");
        edit.classList.add("disabled");
    }else{
        next.classList.remove("disabled");
        edit.classList.remove("disabled");
    }
}
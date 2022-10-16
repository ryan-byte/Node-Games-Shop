const infoContainer = document.getElementById("infoContainer");
const editInfo = document.getElementById("editInfo");
const next = document.getElementById("next");


let selectedElement = "";

disableSelectButtons(true);
showInformations();

//show info functions
async function showInformations(){
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
}
function renderInfo(data){
    const infoItem = document.createElement("li");
    infoItem.classList.add("list-group-item","list-group-item-action","infoItem");
    infoItem.setAttribute("onclick","selectInfo(this)");
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
        editInfo.classList.add("disabled");
    }else{
        next.classList.remove("disabled");
        editInfo.classList.remove("disabled");
    }
}
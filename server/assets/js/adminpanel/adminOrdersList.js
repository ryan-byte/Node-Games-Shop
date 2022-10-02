const orderList = document.getElementById("orderList");
const unverified = document.getElementById("unverified")
const verified = document.getElementById("verified")
const declined = document.getElementById("declined")
const bootstrap_borderSize = 3;

//main function
async function getAllOrders(verificationStatus = 0){
    disableAllApiRequestButtons(true);
    hideSpinner(false);
    if (isNaN(verificationStatus)){
        alert("verification status is not a number");
        return;
    }
    let request = await fetch(`/api/orders/${verificationStatus}`);

    let status = request.status;
    if (status === 200){
        let data = await request.json();
        showOrders(verificationStatus,data);
    }else if (status === 400){
        alert("bad parameters");
    }else if (status === 502){
        alert("bad gateway");
    }else{
        alert("unknown error");
    }
    hideSpinner(true);
    disableAllApiRequestButtons(false);
}

//get orders functions
function showOrders(verificationStatus,data){
    orderList.innerHTML = "";
    if (verificationStatus === 0){
        data.forEach(order => {
            showUnverifiedOrders(order)
        });
    }else if (verificationStatus === 1){
        data.forEach(order => {
            showVerifiedOrders(order)
        });
    }else if (verificationStatus === 2){
        data.forEach(order => {
            showDeclinedOrders(order)
        });
    }
}
function showUnverifiedOrders(data){
    const orderHTML = `
    <div class="px-2 bd-highlight border border-secondary border-${bootstrap_borderSize} rounded mb-2">
        <div class="row">
            <div class = "py-2 col d-flex flex-column bd-highlight">
                <div class="bd-highlight"><b>name:</b> ${data.FirstName} ${data.LastName}</div>
                <div class="bd-highlight"><b>address:</b> ${data.Address} </div>
                <div class="bd-highlight"><b>phone number:</b> ${data.TelNumber} </div>
                <div class="bd-highlight"><b>postal code:</b> ${data.PostalCode} </div>
            </div>
            <div class = "py-2 col d-flex flex-column bd-highlight">
                <div class="bd-highlight">Red dead redemption (20dt)</div>
                <div class="bd-highlight">cyberpunk (10dt)</div>
            </div>
            <div class = "py-2 col ">
                <b>total money:</b> 30dt
            </div>
        </div>
        <div class="p-2 bd-highlight d-flex justify-content-center">
            <button type="button" class="btn btn-outline-success mx-3">Verify</button>
            <button type="button" class="btn btn-outline-danger mx-3">Decline</button>
        </div>
    </div>`;

    orderList.insertAdjacentHTML("beforeend",orderHTML);
}
function showVerifiedOrders(data){
    const orderHTML = `
    <div class="px-2 bd-highlight border-bottom border border-success border-${bootstrap_borderSize} rounded mb-2">
        <div class="row">
            <div class = "py-2 col d-flex flex-column bd-highlight">
                <div class="bd-highlight"><b>name:</b> ${data.FirstName} ${data.LastName}</div>
                <div class="bd-highlight"><b>address:</b> ${data.Address} </div>
                <div class="bd-highlight"><b>phone number:</b> ${data.TelNumber} </div>
                <div class="bd-highlight"><b>postal code:</b> ${data.PostalCode} </div>
            </div>
            <div class = "py-2 col d-flex flex-column bd-highlight">
                <div class="bd-highlight">Red dead redemption (20dt)</div>
                <div class="bd-highlight">cyberpunk (10dt)</div>
            </div>
            <div class = "py-2 col ">
                <b>total money:</b> 30dt
            </div>
        </div>
    </div>`;

    orderList.insertAdjacentHTML("beforeend",orderHTML);
}
function showDeclinedOrders(data){
    const orderHTML = `
    <div class="px-2 bd-highlight border-bottom border border-danger border-${bootstrap_borderSize} rounded mb-2">
        <div class="row">
            <div class = "py-2 col d-flex flex-column bd-highlight">
                <div class="bd-highlight"><b>name:</b> ${data.FirstName} ${data.LastName}</div>
                <div class="bd-highlight"><b>address:</b> ${data.Address} </div>
                <div class="bd-highlight"><b>phone number:</b> ${data.TelNumber} </div>
                <div class="bd-highlight"><b>postal code:</b> ${data.PostalCode} </div>
            </div>
            <div class = "py-2 col d-flex flex-column bd-highlight">
                <div class="bd-highlight">Red dead redemption (20dt)</div>
                <div class="bd-highlight">cyberpunk (10dt)</div>
            </div>
            <div class = "py-2 col ">
                <b>total money:</b> 30dt
            </div>
        </div>
    </div>`;

    orderList.insertAdjacentHTML("beforeend",orderHTML);
}

//user feedback functions
function disableAllApiRequestButtons(bool){
    unverified.disabled = bool;
    verified.disabled = bool;
    declined.disabled = bool;
}
function hideSpinner(hide = true){
    if (hide){
        spinner.style.display = "none";
    }else{
        spinner.style.display = "block";
    }
}
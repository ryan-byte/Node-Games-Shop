const newAlertContainer = addNewAlertContainer();

//main functions
function addNewAlertContainer(){
    const div = document.createElement("div");
    div.id = "newAlertContainer";
    document.body.appendChild(div);
    return div;
}

function newAlert_danger(output){
    let html = `
    <div class="alert alert-danger alert-dismissible fade show mb-3 me-3" role="alert">
        <div>${output}</div>
        <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
    </div>`;
    newAlertContainer.innerHTML = html;
    newAlert_shakeAnimation()
}
function newAlert_success(output){
    let html = `
    <div class="alert alert-success alert-dismissible mb-3 me-3" role="alert">
        <div>${output}</div>
        <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
    </div>`;
    newAlertContainer.innerHTML = html;
    newAlert_shakeAnimation()
}
function newAlert_warning(output){
    let html = `
    <div class="alert alert-dark alert-dismissible mb-3 me-3" role="alert">
        <div>${output}</div>
        <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
    </div>`;
    newAlertContainer.innerHTML = html;
    newAlert_shakeAnimation()
}

//side functions
function newAlert_shakeAnimation(){
    //reset animation
    newAlertContainer.style.animation = 'none';
    newAlertContainer.offsetHeight; /* trigger reflow */
    //run animation
    newAlertContainer.style.display = "block";
    newAlertContainer.style.animation = "shake 0.3s";
}
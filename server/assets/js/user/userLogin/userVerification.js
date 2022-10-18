const verificationForm = document.getElementById("verificationForm");
const code = document.getElementById("verificationCode");
const submit = document.getElementById("submit");
const spinner = document.getElementById("spinner");

const codeInputMaxLength = parseInt(code.getAttribute("maxlength"));

code.addEventListener("input",(ev)=>{
    if (code.value.length === codeInputMaxLength){
        submit.click();
    }
})


verificationForm.addEventListener("submit",async (ev)=>{
    ev.preventDefault();
    //user feedback
    disableButtons(true);
    spinnerStatus(false);

    //verification request
    let postURL = window.location.pathname;

    const data = {code:code.value};
    let request = await fetch(postURL, {  
                                method: 'post',
                                mode:"no-cors",
                                headers: {'Content-Type': 'application/x-www-form-urlencoded'},
                                body: new URLSearchParams(data),});
    if (request.redirected){
        window.location.replace(request.url);
    }else if (request.status === 404){
        newAlert_danger("wrong");
    }else if (request.status === 502){
        newAlert_danger("gateway server error");
    }else if (request.status === 500){
        newAlert_danger("internal server error");
    }else{
        newAlert_danger("unknown error status:"+request.status);
    }
    disableButtons(false);
    spinnerStatus(true);
});

function disableButtons (bool){
    submit.disabled = bool;
}
function spinnerStatus(hide = true){
    if (hide){
        spinner.style.display = "none";
    }else{
        spinner.style.display = "block";
    }
}
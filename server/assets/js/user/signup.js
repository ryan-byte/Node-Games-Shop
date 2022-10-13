const signupForm = document.getElementById("signupForm");
const username = document.getElementById("username");
const email = document.getElementById("email");
const password = document.getElementById("password");
const confirmPassword = document.getElementById("confirmPassword");
const submit = document.getElementById("submit");
const spinner = document.getElementById("spinner");


signupForm.addEventListener("submit",async (ev)=>{
    ev.preventDefault();
    //user feedback
    disableButtons(true);
    spinnerStatus(false);
    if (password.value !== confirmPassword.value){
        newAlert_danger("password must be equal to confirm password");
        disableButtons(false);
        spinnerStatus(true);
        return;
    }
    //signup request
    let postURL = window.location.pathname;

    const data = {username:username.value,email:email.value,password:password.value}
    let request = await fetch(postURL, {  
                                method: 'post',
                                mode:"no-cors",
                                headers: {'Content-Type': 'application/x-www-form-urlencoded'},
                                body: new URLSearchParams(data)});
    if (request.redirected){
        window.location.replace(request.url);
    }else if (request.status === 404){
        newAlert_danger("not found");
    }else if (request.status === 400){
        newAlert_danger("Bad inputs (password must be longer then 8)");
    }else if (request.status === 409){
        newAlert_danger("username or email already exists");
    }else{
        newAlert_danger("Unknown error");
    }
    disableButtons(false);
    spinnerStatus(true);
})

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
const loginForm = document.getElementById("loginForm");
const username = document.getElementById("username");
const password = document.getElementById("password");
const submit = document.getElementById("submit");
const spinner = document.getElementById("spinner");

loginForm.addEventListener("submit",async (ev)=>{
    ev.preventDefault();
    //user feedback
    disableButtons(true);
    spinnerStatus(false);
    
    //admin login request
    let postURL = window.location.pathname;

    const data = {username:username.value,password:password.value}
    let request = await fetch(postURL, {  
                                method: 'post',
                                mode:"no-cors",
                                headers: {'Content-Type': 'application/x-www-form-urlencoded'},
                                body: new URLSearchParams(data),
                            })
    if (request.redirected){
        window.location.replace(request.url);
    }else if (request.status === 404){
        alert("not found");
    }else{
        alert("server error");
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
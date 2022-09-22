const loginForm = document.getElementById("loginForm");
const username = document.getElementById("username");
const password = document.getElementById("password");

loginForm.addEventListener("submit",async (ev)=>{
    ev.preventDefault();
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
})
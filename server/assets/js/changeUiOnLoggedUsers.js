const loginButtonContainer = document.getElementById("loginOrLogoutButtonContainer");
const adminLoginButton = document.getElementById("adminLoginButton");

onload();

async function onload(){
    //request the cookie data from the endpoint
    try{
        let userDataCookie = getCookie("info");
        let userData = JSON.parse(decodeURIComponent(userDataCookie));
        if (userData.admin) adminUser_changeLoginButtonToUsername(userData.username);
        else normalUser_changeLoginButtonToUsername(userData.username);
        //hide the admin login button
        if (adminLoginButton!==null){
            console.log("removing admin login button");
            adminLoginButton.style.display = "none";
        }

    }catch(err){
        console.log("User is not logged in");
    }
}

function normalUser_changeLoginButtonToUsername(username){
    loginButtonContainer.innerHTML = `
    <div class="btn-group">
        <button type="button" class="btn btn-primary dropdown-toggle" data-bs-toggle="dropdown" aria-expanded="false">
            ${username}
        </button>
        <ul class="dropdown-menu dropdown-menu-dark dropdown-menu-end">
            <li><a class="dropdown-item" href="/">Homepage</a></li>
            <li><a class="dropdown-item" href="/userOrders">Track My Orders</a></li>
            <li><hr class="dropdown-divider"></li>
            <li>
                <form action="/logout" method="post">
                    <button id = "submit" class="dropdown-item">Logout</button>
                </form>
            </li>
        </ul>
    </div>
    `
}
function adminUser_changeLoginButtonToUsername(username){
    loginButtonContainer.innerHTML = `
    <div class="btn-group">
        <button type="button" class="btn btn-danger dropdown-toggle" data-bs-toggle="dropdown" aria-expanded="false">
            ${username}
        </button>
        <ul class="dropdown-menu dropdown-menu-dark dropdown-menu-end">
            <li><a class="dropdown-item" href="/">Homepage</a></li>
            <li><a class="dropdown-item" href="/adminpanel">Admin Panel</a></li>
            <li><hr class="dropdown-divider"></li>
            <li>
                <form action="/logout" method="post">
                    <button id = "submit" class="dropdown-item">Logout</button>
                </form>
            </li>
        </ul>
    </div>
    `
};

function getCookie(cookieName) {
    var allcookies = document.cookie;
    var arrayb = allcookies.split("; ");
    for (let item of arrayb){
        if (item.startsWith(cookieName)){
            var cookie = item.substr(cookieName.length+1);
            return cookie;
        }
    }
}
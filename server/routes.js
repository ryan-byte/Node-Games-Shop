const path = require("path");
const jwt = require("jsonwebtoken");
const cookie = require("cookie");
const database = require("./database/database");
const crypto = require("crypto");
const hashPassword = require("./utils/hashPassword");

const secretKey = process.env.jwtSecretKey;
const tokenExpire = 60 * 60 * 24;

const accessCookieName = process.env.accessCookieName || "login";

//public routes
function getHomepage(req,res){
    res.status(200).sendFile(path.join(__dirname + "/assets/html/index.html"));
}

//not logged users only
function getAdminLogin(req,res){
    //must be called after a middleware that verify if the user is already logged in
    res.status(200).sendFile(path.join(__dirname + "/assets/html/adminLogin.html"));
}
async function postAdminLogin(req,res){
    //verify login
    //username and password must be sent from urlencoded form
    let {username,password} = req.body;
    let verification = await database.verifyAdmin(username,password);
    if (verification["error"]){
        res.sendStatus(502);
    }else if (verification === false){
        res.sendStatus(404);
    }else if (verification["userID"]){
        //sign a jwt token
        try{
            let userID = verification["userID"];
            let token = jwt.sign({username,admin:true,userID},secretKey,{expiresIn:tokenExpire}); //expires in 1 day
            
            res.setHeader('Set-Cookie', cookie.serialize(accessCookieName, token, {
                httpOnly: true,
                sameSite:"strict",
                maxAge: tokenExpire //1 day
            }));
            res.redirect("/adminpanel");
            //save logs
            database.logUserAction(username,`Admin logged in`);
        }catch (err){
            res.sendStatus(400);
        }
    }else{
        res.sendStatus(500);
    }
}

function getUserSignup(req,res){
    //must be called after a middleware that verify if the user is not logged in
    res.status(200).sendFile(path.join(__dirname + "/assets/html/user/userSignup.html"));
}

async function postUserSignup(req,res){
    //must be called after a middleware that verify if the user is not logged in
    //username and password must be sent from urlencoded form
    let {username,email,password} = req.body;
    let condition = username === ""||
                    typeof username === "undefined"||
                    email === ""||
                    typeof email === "undefined"||
                    password === ""||
                    password.length < 8||
                    typeof password === "undefined";
    if (condition){
        res.sendStatus(400);
        return;
    }
    let hashKey = crypto.randomBytes(16).toString("hex");
    let hashedPassword = hashPassword(password,hashKey);
    let output = await database.createUser(username,email,hashedPassword,hashKey);
    if (output["error"]){
        res.sendStatus(502);
        return;
    }else if (output === false){
        res.sendStatus(409);
    }else{
        res.redirect("/userLogin");
    }
}

function getUserLogin(req,res){
    //must be called after a middleware that verify if the user is already logged in
    res.status(200).sendFile(path.join(__dirname + "/assets/html/user/userLogin.html"));
}
async function postUserLogin(req,res){
    //verify login
    //username and password must be sent from urlencoded form
    let {username,password} = req.body;
    let verification = await database.verifyUser(username,password);
    if (verification["error"]){
        res.sendStatus(502);
    }else if (verification === false){
        res.sendStatus(404);
    }else if (verification["userID"]){
        //sign a jwt token
        try{
            let userID = verification["userID"];
            let token = jwt.sign({username,admin:false,userID},secretKey,{expiresIn:tokenExpire}); //expires in 1 day
            
            res.setHeader('Set-Cookie', cookie.serialize(accessCookieName, token, {
                httpOnly: true,
                sameSite:"strict",
                maxAge: tokenExpire //1 day
            }));
            res.redirect("/");
            //save logs
            database.logUserAction(username,`User logged in`);
        }catch (err){
            res.sendStatus(400);
        }
    }else{
        res.sendStatus(500);
    }
}

//any logged user
function logout(req,res){
    res.clearCookie(accessCookieName);
    res.redirect("/");
}
function getUserDataFromCookie(req,res){
    //get the jwt token (stored in a cookie)
    let allCookies = cookie.parse(req.headers.cookie || "");
    let accessToken = allCookies[accessCookieName];
    //accesstoken already verified in the middleware so just decode now
    let userData = jwt.decode(accessToken);
    res.send(userData);
}

//only normal users routes
function getOrderPage(req,res){
    res.status(200).sendFile(path.join(__dirname + "/assets/html/order/order.html"));
}
async function postOrder(req,res){
    //get the order informations
    let {FirstName,LastName,TelNumber,Address,City,PostalCode,games} = req.body;
    //verify the order informations
    let condition = FirstName === ""||
                    typeof FirstName === "undefined"||
                    LastName === ""||
                    typeof LastName === "undefined"||
                    TelNumber === ""||
                    typeof TelNumber === "undefined"||
                    Address === ""||
                    typeof Address === "undefined"||
                    City === ""||
                    typeof City === "undefined"||
                    games === ""||
                    typeof games === "undefined"||
                    PostalCode === ""||
                    typeof PostalCode === "undefined";
    try{
        games = JSON.parse(games);
        //verify the games quantity
        Object.values(games).forEach(quantity =>{
            if (isNaN(quantity)){
                condition = true;
            }
        })
    }catch (err){
        res.sendStatus(400);
        return;
    }
    if (condition){
        res.sendStatus(400);
        return;
    }
    //last thing is to get the user ID that is stored in the cookie
    //note that the cookie must be verified in a middleware before this route
    let allCookies = cookie.parse(req.headers.cookie || "");
    let accessToken = allCookies[accessCookieName];
    let userID = jwt.decode(accessToken).userID;
    //when everything is fine then add the order to the database
    let statusCode = await database.createNewOrder(userID,FirstName,LastName,TelNumber,Address,City,PostalCode,games);
    //send back the status code to the client
    res.sendStatus(statusCode);
}

function getUserOrdersPage(req,res){
    res.status(200).sendFile(path.join(__dirname + "/assets/html/user/userOrders.html"));
}

//admin users only
function getadminpanel(req,res){
    res.status(200).sendFile(path.join(__dirname + "/assets/html/adminpanel/adminpanel.html"));
}
function getadminpanelAddGame(req,res){
    res.status(200).sendFile(path.join(__dirname + "/assets/html/adminpanel/addGame.html"));
}

function getadminpanelOrderList(req,res){
    res.status(200).sendFile(path.join(__dirname + "/assets/html/adminpanel/ordersList.html"));
}





module.exports = {getHomepage,
                getOrderPage,postOrder,
                getAdminLogin,
                postAdminLogin,
                getadminpanel,
                getadminpanelAddGame,
                getadminpanelOrderList,
                logout,getUserDataFromCookie,
                getUserLogin,postUserLogin,getUserOrdersPage,
                getUserSignup,postUserSignup};
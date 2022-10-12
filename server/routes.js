const path = require("path");
const jwt = require("jsonwebtoken");
const cookie = require("cookie");
const database = require("./database/database");
const crypto = require("crypto");
const hashPassword = require("./utils/hashPassword");
const randomNumber = require("./utils/randomNumber");
const {sendVerificationCode} = require("./utils/sendMail");

const secretKey = process.env.jwtSecretKey;
const tokenExpire = 60 * 60 * 24;

const accessCookieName = process.env.accessCookieName || "login";
const userInfosCookieName = "info";
const userVerificationCookieName = process.env.userVerificationCookieName || "verification";
const unverifiedUserDataExpirationTimeInSec = parseInt(process.env.unverifiedUserDataExpirationTimeInSec) || 1800;
//public routes
function getHomepage(req,res){
    res.status(200).sendFile(path.join(__dirname + "/assets/html/index.html"));
}
function removeVerificationCookie(req,res){
        //remove the verification cookie
        res.clearCookie(userVerificationCookieName);
        res.redirect("/userLogin");
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
            //add the access cookie which allow the user to do some actions in the backend
            res.setHeader('Set-Cookie', cookie.serialize(accessCookieName, token, {
                httpOnly: true,
                sameSite:"strict",
                maxAge: tokenExpire //1 day
            }));
            //Add the info cookie which the frontend use to get some infos about the user
            let userInfo = {username,admin:true};
            res.cookie(userInfosCookieName,JSON.stringify(userInfo),{
                maxAge: tokenExpire * 1000//1 day
            });

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
    //username, email and password must be sent from urlencoded form
    let {username,email,password} = req.body;
    let condition = username === ""||
                    typeof username === "undefined"||
                    email === ""||
                    typeof email === "undefined"||
                    password === ""||
                    password.length < 8||
                    typeof password === "undefined";
    //validate the email format
    let splitEmail =  email.split("@");
    let emailWrongFormat =splitEmail.length <= 1 || splitEmail[1] === "";
    if (condition || emailWrongFormat){
        res.sendStatus(400);
        return;
    }
    //prepare the user data
    let hashKey = crypto.randomBytes(16).toString("hex");
    let hashedPassword = hashPassword(password,hashKey);
    //random integer that will be sent in an email to the user for verification
    let verificationCode = randomNumber(100000,999999);

    
    let output = await database.createUnverifiedUser(username,email,hashedPassword,hashKey,verificationCode);
    if (output["error"]){
        res.sendStatus(502);
        return;
    }else if (output.status === false){
        res.sendStatus(409);
    }else{
        //send an email to the user
        sendVerificationCode(verificationCode,email);
        //setup cookie
        let userID = output.userID;
        //give the user a cookie that contains the user_id so that he get access to the verification page
        let token = jwt.sign({userID},secretKey,{expiresIn:unverifiedUserDataExpirationTimeInSec});
        res.setHeader('Set-Cookie', cookie.serialize(userVerificationCookieName, token, {
            httpOnly: true,
            sameSite:"strict",
            maxAge: unverifiedUserDataExpirationTimeInSec
        }));
        res.redirect("/userVerification");
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
    let verification = await database.verifyUserCredentials(username,password);
    if (verification["error"]){
        res.sendStatus(502);
    }else if (verification === false){
        res.sendStatus(404);
    }else if (verification["userID"]){
        //sign a jwt token
        try{
            let userID = verification["userID"];
            let token = jwt.sign({username,admin:false,userID},secretKey,{expiresIn:tokenExpire}); //expires in 1 day
            //add the access cookie which allow the user to do some actions in the backend
            res.setHeader('Set-Cookie', cookie.serialize(accessCookieName, token, {
                httpOnly: true,
                sameSite:"strict",
                maxAge: tokenExpire //1 day
            }));
            //Add the info cookie which the frontend use to get some infos about the user
            let userInfo = {username,admin:false};
            res.cookie(userInfosCookieName,JSON.stringify(userInfo),{
                maxAge: tokenExpire * 1000//1 day
            });
            
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
    res.clearCookie(userInfosCookieName);
    res.clearCookie(accessCookieName);
    res.redirect("/");
}

//only users with the unverified cookie
function getVerificationPage(req,res){
    //must be called after a middleware that checks if the user has the unverified cookie
    res.status(200).sendFile(path.join(__dirname + "/assets/html/user/userVerification.html"));
}
async function postVerificationPage(req,res){
    /must call a middleware that check if the jwt inside the verification cookie is valid/
    let allCookies = cookie.parse(req.headers.cookie || "");
    let verificationCookie = allCookies[userVerificationCookieName];
    let userID = jwt.decode(verificationCookie).userID;
    let {code} = req.body;
    
    let output = await database.verifyUserSignup(userID,code);
    if (output["error"]){
        res.sendStatus(502);
        return;
    }else if (output.status === false){
        res.sendStatus(404);
    }else{
        let data = output.data;
        let username = data.username;
        let email = data.email;
        let hashedPassword = data.hashedPassword;
        let hashKey = data.hashKey;
        //save user data to the db and get the userID
        let createdUser = await database.createVerifiedUser(username,email,hashedPassword,hashKey);
        if (createdUser["error"]){
            res.sendStatus(500);
            return;
        }
        //delete the unverified user from the db
        let unverifiedUserID = output.userID;
        await database.deleteUnverifiedUser(unverifiedUserID);
        //redirect
        res.redirect("/removeVerificationCookie");
    }
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
                logout,
                getUserLogin,postUserLogin,getUserOrdersPage,
                getUserSignup,postUserSignup,
                getVerificationPage,postVerificationPage,
                removeVerificationCookie};
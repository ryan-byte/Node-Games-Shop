const path = require("path");
const jwt = require("jsonwebtoken");
const cookie = require("cookie");
const database = require("./database/database");
const crypto = require("crypto");
const hashPassword = require("./utils/hashPassword");
const randomNumber = require("./utils/randomNumber");
const {sendVerificationCode} = require("./utils/sendMail");

const {getGoogleAuthURL} = require("./utils/gmailOpenID");

const secretKey = process.env.jwtSecretKey;
const tokenExpire = 60 * 60 * 24;

const accessCookieName = "login";
const userInfosCookieName = "info";
const DeliveryInfoCookieName= "deliveryInfo";
const userVerificationCookieName = "verification";
const antiForgeryCookieName = "state";
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
            res.cookie(accessCookieName, token, {
                httpOnly: true,
                sameSite:"strict",
                maxAge: tokenExpire * 1000 //1 day
            });
            //Add the info cookie which the frontend use to get some infos about the user
            let userInfo = {username,admin:true};
            res.cookie(userInfosCookieName,JSON.stringify(userInfo),{
                maxAge: tokenExpire * 1000//1 day
            });

            //save logs
            await database.logUserAction(username,`Admin logged in`,"login");
            //redirect
            res.redirect("/adminpanel");
        }catch (err){
            res.sendStatus(400);
        }
    }else{
        res.sendStatus(500);
    }
}

function getUserSignup(req,res){
    //must be called after a middleware that verify if the user is not logged in
    res.status(200).sendFile(path.join(__dirname + "/assets/html/user/userLogin/userSignup.html"));
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
    res.status(200).sendFile(path.join(__dirname + "/assets/html/user/userLogin/userLogin.html"));
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
            res.cookie(accessCookieName, token, {
                httpOnly: true,
                sameSite:"strict",
                maxAge: tokenExpire * 1000 //1 day
            });
            //Add the info cookie which the frontend use to get some infos about the user
            let userInfo = {username,admin:false};
            res.cookie(userInfosCookieName,JSON.stringify(userInfo),{
                maxAge: tokenExpire * 1000//1 day
            });
            
            //save logs
            await database.logUserAction(username,`User logged in`,"login");
            //redirect
            res.redirect("/");
        }catch (err){
            res.sendStatus(400);
        }
    }else{
        res.sendStatus(500);
    }
}

function openIDConnect_gmail_login(req,res){
    //add a random hashed number to the state 
    let hashedRandomState = crypto.createHash('sha256').update(crypto.randomBytes(30)).digest('hex');
    let url = getGoogleAuthURL(hashedRandomState);
    //create a safe cookie that will contain this hashed number to verify if it matches later 
    res.cookie(antiForgeryCookieName, hashedRandomState, {
        maxAge: tokenExpire * 10 //1 day
    });
    res.redirect(url);
}
async function googleConnect_redirect(req,res){
    /* 
    before getting to this route the user must 
    go throught the middleware and verify 
    if the user already signed up as this openID service,
    if the user is new,
    if the user is logged with another openID service or logged with a normal password
    */
    //get the userID and username
    let userID = res.locals.userID;
    let username = res.locals.username;
    //give the user a jwt login token
    let token = jwt.sign({username,admin:false,userID},secretKey,{expiresIn:tokenExpire}); //expires in 1 day
    //add the access cookie which allow the user to do some actions in the backend
    res.cookie(accessCookieName, token, {
        httpOnly: true,
        sameSite:"strict",
        maxAge: tokenExpire * 1000 //1 day
    });
    //Add the info cookie which the frontend use to get some infos about the user
    let userInfo = {username,admin:false};
    res.cookie(userInfosCookieName,JSON.stringify(userInfo),{
        maxAge: tokenExpire * 1000//1 day
    });
    
    //save logs
    await database.logUserAction(username,`User logged in`,"login");
    //redirect
    res.redirect("/");

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
    res.status(200).sendFile(path.join(__dirname + "/assets/html/user/userLogin/userVerification.html"));
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
async function postOrder(req,res){
    //get the order informations
    let allCookies = cookie.parse(req.headers.cookie || "");
    let accessCookie = allCookies[accessCookieName];
    const decodedJWT = jwt.decode(accessCookie);
    const userID = decodedJWT.userID;
    let {deliveryInfoId,games} = req.body;
    const data = await database.getSpecificUserDeliveryInfo(userID,deliveryInfoId);
    if (data === null){
        res.sendStatus(404);
        return;
    }else if (data["error"]){
        res.sendStatus(data.status);
        return;
    }
    const {FirstName,LastName,TelNumber,Address,City,PostalCode} = data;
    //verify the order informations
    let condition = games === ""||
                    typeof games === "undefined";
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
    //when everything is fine then add the order to the database
    let output = await database.createNewOrder(userID,FirstName,LastName,TelNumber,Address,City,PostalCode,games);
    //log action
    if (output.orderID){
        await database.logUserAction(decodedJWT.username,`Created an order with the id of ${output.orderID}`,"createOrder");
    }
    //send back the status code to the client
    res.sendStatus(output.status);
}

function getDeliveryInfoSelect(req,res){
    res.status(200).sendFile(path.join(__dirname + "/assets/html/user/userOrder/selectDeliveryInfo.html"));
}

async function selectDeliveryInfo(req,res){
    //get the userID and the infoId
    let allCookies = cookie.parse(req.headers.cookie || "");
    let accessToken = jwt.decode(allCookies[accessCookieName]);
    const {userID} = accessToken;
    const {deliveryInfoId} = req.body;
    //get selected address id that is with the user id
    let data = await database.getSpecificUserDeliveryInfo(userID,deliveryInfoId);
    if (data === null){
        res.sendStatus(404);
    }else if (data["error"]){
        res.sendStatus(data.status);
    }else{
        //give the use a selectedInfo cookie
        res.cookie(DeliveryInfoCookieName,deliveryInfoId,{
            maxAge: tokenExpire * 100//1 day
        });
        res.sendStatus(200);
    }
}

function getDeliveryInfoAdd(req,res){
    res.status(200).sendFile(path.join(__dirname + "/assets/html/user/userOrder/addDeliveryInfo.html"));
}
async function postDeliveryInfoAdd(req,res){
    //must verify inputs in a middleware
    const {FirstName,LastName,TelNumber,Address,City,PostalCode} = req.body;
    //last thing is to get the user ID that is stored in the cookie
    //note that the cookie must be verified in a middleware before this route
    let allCookies = cookie.parse(req.headers.cookie || "");
    let accessToken = allCookies[accessCookieName];
    let userID = jwt.decode(accessToken).userID;
    //when everything is fine then add the order to the database
    let statusCode = await database.addUserDeliveryInfo(userID,FirstName,LastName,TelNumber,Address,City,PostalCode);
    //send back the status code to the client
    res.sendStatus(statusCode);
    
}

function getDeliveryInfoEdit(req,res){
    res.status(200).sendFile(path.join(__dirname + "/assets/html/user/userOrder/editDeliveryInfo.html"));
}
async function putDeliveryInfoEdit(req,res){
    //must verify inputs in a middleware
    const {deliveryInfoId,FirstName,LastName,TelNumber,Address,City,PostalCode} = req.body;
    //last thing is to get the user ID that is stored in the cookie
    //note that the cookie must be verified in a middleware before this route
    let allCookies = cookie.parse(req.headers.cookie || "");
    let accessToken = allCookies[accessCookieName];
    let userID = jwt.decode(accessToken).userID;
    //when everything is fine then add the order to the database
    let statusCode = await database.editUserDeliveryInfo(userID,deliveryInfoId,FirstName,LastName,TelNumber,Address,City,PostalCode);
    //send back the status code to the client
    res.sendStatus(statusCode); 
}

async function deleteDeliveryInfo(req,res){
    const {deliveryInfoId} = req.body;
    let invalid =   deliveryInfoId === ""||
                    typeof deliveryInfoId === "undefined";
    if (invalid){
        res.sendStatus(400);
        return;
    }
    //last thing is to get the user ID that is stored in the cookie
    //note that the cookie must be verified in a middleware before this route
    let allCookies = cookie.parse(req.headers.cookie || "");
    let accessToken = allCookies[accessCookieName];
    let userID = jwt.decode(accessToken).userID;
    //when everything is fine then add the order to the database
    let statusCode = await database.deleteUserDeliveryInfo(userID,deliveryInfoId);
    //send back the status code to the client
    res.sendStatus(statusCode);
}

function getOrderConfirmationPage(req,res){
    res.status(200).sendFile(path.join(__dirname + "/assets/html/user/userOrder/orderConfirmation.html"));
}

function getUserOrdersHistoryPage(req,res){
    res.status(200).sendFile(path.join(__dirname + "/assets/html/user/userOrder/viewOrderHistory.html"));
}

//admin users only
function getadminpanel(req,res){
    res.status(200).sendFile(path.join(__dirname + "/assets/html/adminpanel/index.html"));
}
function getadminpanelManage(req,res){
    res.status(200).sendFile(path.join(__dirname + "/assets/html/adminpanel/manageGames.html"));
}
function getadminpanelAddGame(req,res){
    res.status(200).sendFile(path.join(__dirname + "/assets/html/adminpanel/addGame.html"));
}

function getadminpanelOrderList(req,res){
    res.status(200).sendFile(path.join(__dirname + "/assets/html/adminpanel/ordersList.html"));
}

function getadminpanelLogs(req,res){
    res.status(200).sendFile(path.join(__dirname + "/assets/html/adminpanel/logs.html"));
}





module.exports = {getHomepage,
                postOrder,getDeliveryInfoSelect,getDeliveryInfoAdd,getDeliveryInfoEdit,putDeliveryInfoEdit,
                postDeliveryInfoAdd,selectDeliveryInfo,getOrderConfirmationPage,deleteDeliveryInfo,
                getAdminLogin,
                postAdminLogin,
                getadminpanel,
                getadminpanelManage,
                getadminpanelAddGame,
                getadminpanelOrderList,
                getadminpanelLogs,
                logout,
                getUserLogin,postUserLogin,getUserOrdersHistoryPage,
                getUserSignup,postUserSignup,
                getVerificationPage,postVerificationPage,
                removeVerificationCookie,
                openIDConnect_gmail_login,googleConnect_redirect};
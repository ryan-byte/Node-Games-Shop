const path = require("path");
const jwt = require("jsonwebtoken");
const cookie = require("cookie");
const database = require("./database/database");

const secretKey = process.env.jwtSecretKey;
const tokenExpire = 60 * 60 * 24;

const adminLoginCookieName = "jwt"

function getHomepage(req,res){
    res.status(200).sendFile(path.join(__dirname + "/assets/html/index.html"));
}

function getOrderPage(req,res){
    res.status(200).sendFile(path.join(__dirname + "/assets/html/order/order.html"));
}
async function postOrder(req,res){
    //get the order informations
    let {FirstName,LastName,TelNumber,Address,City,PostalCode,GameIDs} = req.body;
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
                    GameIDs === ""||
                    typeof GameIDs === "undefined"||
                    PostalCode === ""||
                    typeof PostalCode === "undefined";
    if (condition){
        res.sendStatus(400);
        return;
    }
    try{
        GameIDs = JSON.parse(GameIDs);
    }catch (err){
        res.sendStatus(400);
        return;
    }
    //when everything is fine then add the order to the database
    let statusCode = await database.createNewOrder(FirstName,LastName,TelNumber,Address,City,PostalCode,GameIDs);
    //send back the status code to the client
    res.sendStatus(statusCode);
}

function getAdminLogin(req,res){
    //get the jwt token (stored in a cookie)
    let allCookies = cookie.parse(req.headers.cookie || "");
    let jwtToken = allCookies[adminLoginCookieName];
    if (jwtToken){
        try{
            //verify the token if it is valid then redirect
            jwt.verify(jwtToken,secretKey);
            res.status(302).redirect("/adminPanel");
        }catch (err){
            //when the token is invalid then the admin login page
            res.status(200).sendFile(path.join(__dirname + "/assets/html/adminLogin.html"));
        }
    }else{
        res.status(200).sendFile(path.join(__dirname + "/assets/html/adminLogin.html"));
    }
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
    }else if (verification === true){
        //sign a jwt token
        try{
            let token = jwt.sign({username},secretKey,{expiresIn:tokenExpire}); //expires in 1 day
            
            res.setHeader('Set-Cookie', cookie.serialize(adminLoginCookieName, token, {
                httpOnly: true,
                sameSite:"strict",
                maxAge: tokenExpire //1 day
            }));
            res.redirect("/adminPanel");
            //save logs
            database.logUserAction(username,`User logged in`);
        }catch (err){
            res.sendStatus(400);
        }
    }else{
        res.sendStatus(500);
    }
}

function getAdminPanel(req,res){
    res.status(200).sendFile(path.join(__dirname + "/assets/html/adminPanel/adminPanel.html"));
}
function getAdminPanelAddGame(req,res){
    res.status(200).sendFile(path.join(__dirname + "/assets/html/adminPanel/addGame.html"));
}

function adminLogout(req,res){
    res.clearCookie(adminLoginCookieName);
    res.redirect("/");
}




module.exports = {getHomepage,
                getOrderPage,postOrder,
                getAdminLogin,
                postAdminLogin,
                getAdminPanel,
                getAdminPanelAddGame,
                adminLogout,};
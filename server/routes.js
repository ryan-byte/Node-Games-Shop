const path = require("path");
const jwt = require("jsonwebtoken");
const cookie = require("cookie");
const database = require("./database/database")

const {secretKey} = require("./jwtSecretKey.json");
const tokenExpire = 60 * 60 * 24;

const adminLoginCookieName = "jwt"

function getHomepage(req,res){
    res.status(200).sendFile(path.join(__dirname + "/assets/html/index.html"));
}

function getAdminLogin(req,res){
    //if cookie doesnt exist show the admin login page otherwise redirect
    let jwtCookie = cookie.parse(req.headers.cookie || "");
    let token = jwtCookie[adminLoginCookieName];
    if (token){
        //verify the token if it is invalid then show the user the page
        try{
            jwt.verify(token,secretKey);
            res.status(302).redirect("/adminPanel");
        }catch (err){
            res.status(200).sendFile(path.join(__dirname + "/assets/html/adminLogin.html"));
        }
    }else{
        res.status(200).sendFile(path.join(__dirname + "/assets/html/adminLogin.html"));
    }
}
async function postAdminLogin(req,res){
    //verify login
    let {username,password} = req.body;
    let verification = await database.verifyAdmin(username,password);
    if (verification["error"]){
        res.sendStatus(502);
    }else if (verification === false){
        res.sendStatus(404);
    }else if (verification === true){
        //sign a jwt token
        try{
            let token = jwt.sign({adminID:2},secretKey,{expiresIn:tokenExpire}); //expires in 1 day
    
            res.setHeader('Set-Cookie', cookie.serialize(adminLoginCookieName, token, {
                httpOnly: true,
                sameSite:"strict",
                maxAge: tokenExpire //1 day
            }));
            res.redirect("/adminPanel");
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
                getAdminLogin,
                postAdminLogin,
                getAdminPanel,
                getAdminPanelAddGame,
                adminLogout};
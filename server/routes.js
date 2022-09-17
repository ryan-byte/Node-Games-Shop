const path = require("path");
const jwt = require("jsonwebtoken");
const cookie = require("cookie");

const {secretKey} = require("./jwtSecretKey.json");
const tokenExpire = 60 * 60 * 24;

function getHomepage(req,res){
    res.status(200).sendFile(path.join(__dirname + "/assets/html/index.html"));
}

function getAdminLogin(req,res){
    //if cookie doesnt exist show the admin login page otherwise redirect
    let jwtCookie = cookie.parse(req.headers.cookie || "");
    let token = jwtCookie.jwt;
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

function postAdminLogin(req,res){
    //verify login

    //sign a jwt token
    try{
        let token = jwt.sign({adminID:2},secretKey,{expiresIn:tokenExpire}); //expires in 1 day

        res.setHeader('Set-Cookie', cookie.serialize('jwt', token, {
            httpOnly: true,
            sameSite:"strict",
            maxAge: tokenExpire //1 day
        }));
        res.status(302);
        res.redirect("/adminPanel");
    }catch (err){
        res.sendStatus(400);
    }
}

function getAdminPanel(req,res){
    res.status(200).sendFile(path.join(__dirname + "/assets/html/adminPanel.html"));
}

module.exports = {getHomepage,getAdminLogin,postAdminLogin,getAdminPanel};
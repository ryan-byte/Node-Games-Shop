const path = require("path");
const jwt = require("jsonwebtoken");
const cookie = require("cookie");
const database = require("./database/database");
const Busboy = require("busboy");

const secretKey = process.env.jwtSecretKey;
const tokenExpire = 60 * 60 * 24;
const maxImgUploadSize = parseInt(process.env.maxImgUploadSize) || 5000000;

const adminLoginCookieName = "jwt"

function getHomepage(req,res){
    res.status(200).sendFile(path.join(__dirname + "/assets/html/index.html"));
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

function uploadFile(req,res){
    const bb = Busboy({headers:req.headers,limits:{fileSize:maxImgUploadSize}});
    bb.totalSize = 0;
    bb.status = 200;
    bb.on("file",(name,file,info)=>{
        const {mimeType} = info;
        console.log(mimeType);
        file.on("data",(chunk)=>{
            bb.totalSize += chunk.length;
        });
        file.on("close",()=>{
            if (file.truncated){
                bb.emit("filesLimit");
            }
        })
    })
    bb.on("filesLimit",()=>{
        bb.status = 413;
    })
    bb.on("close",()=>{
        res.sendStatus(bb.status);
    })
    req.pipe(bb);
}

module.exports = {getHomepage,
                getAdminLogin,
                postAdminLogin,
                getAdminPanel,
                getAdminPanelAddGame,
                adminLogout,
                uploadFile};
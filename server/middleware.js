const jwt = require("jsonwebtoken");
const cookie = require("cookie");
const Busboy = require("busboy");
const randomName = require("./utils/randomName");
const fireBaseStorage = require("./utils/firebaseStorage");

const accessCookieName = process.env.accessCookieName || "login";
const userVerificationCookieName = process.env.userVerificationCookieName || "verification";
const secretKey = process.env.jwtSecretKey;
const maxImgUploadSize = parseInt(process.env.maxImgUploadSize) || 5000000;

//the difference between this function and the server_verifyAdmin is:
//api function sends an unauth status code
//server function redirect to the /adminLogin route  

function api_verifyAdmin_middleware(req,res,next){
    //get jwt token
    let jwtCookie = cookie.parse(req.headers.cookie || "");
    let token = jwtCookie[accessCookieName];
    if (token){
        try{
            let decode = jwt.verify(token,secretKey);
            let admin = decode.admin;
            res.locals.username = decode.username;
            if (admin) next();
            else res.sendStatus(403);
        }catch (err){
            res.sendStatus(401);
        }
    }else{
        res.sendStatus(401);
    }
}

function webpage_verifyAdmin_middleware(req,res,next){
    //get jwt token
    let jwtCookie = cookie.parse(req.headers.cookie || "");
    let token = jwtCookie[accessCookieName];
    if (token){
        try{
            let decode = jwt.verify(token,secretKey);
            let admin = decode.admin;
            if (admin) next();
            else res.sendStatus(403);

        }catch (err){
            res.status(302).redirect("/adminLogin")
        }
    }else{
        res.status(302).redirect("/adminLogin");
    }
}

function noLoggedUserAllowed(req,res,next){
    //get the jwt token (stored in a cookie)
    let allCookies = cookie.parse(req.headers.cookie || "");
    let accessToken = allCookies[accessCookieName];
    if (accessToken){
        try{
            //verify the token if it is valid then redirect
            let decode = jwt.verify(accessToken,secretKey);
            let admin = decode.admin;
            if (admin) res.status(302).redirect("/adminpanel");
            else res.status(302).redirect("/");
        }catch (err){
            //when the token is invalid then the admin login page
            next();
        }
    }else{
        next();
    }
}

function anyLoggedUser(req,res,next){
    //get the jwt token (stored in a cookie)
    let allCookies = cookie.parse(req.headers.cookie || "");
    let accessToken = allCookies[accessCookieName];
    if (accessToken){
        try{
            //verify the token if it is valid then redirect
            jwt.verify(accessToken,secretKey);
            next();
        }catch (err){
            //when the token is invalid then the admin login page
            res.status(302).redirect("/userLogin");
        }
    }else{
        res.status(302).redirect("/userLogin");
    }
}

function onlyNormalUsersAllowed(req,res,next){
    //get the jwt token (stored in a cookie)
    let allCookies = cookie.parse(req.headers.cookie || "");
    let accessToken = allCookies[accessCookieName];
    if (accessToken){
        try{
            let decode = jwt.verify(accessToken,secretKey);
            let admin = decode.admin;
            if (admin) res.sendStatus(403);
            else next();
        }catch (err){
            res.status(302).redirect("/userLogin");
        }
    }else{
        res.status(302).redirect("/userLogin");
    }
}

function unverifiedUsers(req,res,next){
    let allCookies = cookie.parse(req.headers.cookie || "");
    let verificationCookie = allCookies[userVerificationCookieName];
    if (verificationCookie){
        try{
            //verify the token if it is valid then next
            jwt.verify(verificationCookie,secretKey);
            next();
        }catch (err){
            //when the token is invalid then send a forbiddent status code
            res.sendStatus(403);
        }
    }else{
        res.sendStatus(403);
    }
}

function image_upload_middleware(req,res,next){
    const bb = Busboy({headers:req.headers,limits:{fileSize:maxImgUploadSize}});
    //setup bb vars
    bb.fileBase64 = "";
    bb.totalSize = 0;
    bb.status = 200;

    bb.on("file",(name,file,info)=>{
        
        const {mimeType} = info;
        let ext = "";
        if (mimeType === "image/jpeg"){
            ext = ".jpg";
        }else if (mimeType === "image/png"){
            ext = ".png";
        }else{
            //a client error status code that indicates that his file mimetype is unaccepted
            bb.status = 415;
        }
        //setup the file meta data
        bb.fileName = randomName() + ext;
        file.setEncoding("base64");

        file.on("data",(chunk)=>{
            if (ext === ".png" || ext === ".jpg"){
                //store all the file base64 in a variable
                bb.fileBase64 += chunk;
            }
        })

        file.on("close",()=>{
            if (file.truncated){
                bb.emit("filesLimit");
            }
        })
    })
    bb.on("filesLimit",()=>{
        bb.status = 413;
    })
    bb.on("close", async ()=>{
        if (bb.status === 200){
            //proceed to the next function if everything is fine
            if (bb.fileName !== undefined){
                let imageURL = await fireBaseStorage.uploadImage(bb.fileBase64,bb.fileName);
                if (imageURL["error"]){
                    //when an error occure then stop the request
                    console.log(imageURL["error"]);
                    console.log("error while uploading the image to the firebase storage");
                    res.sendStatus(500);
                }else{
                    //when there is no error keep the request going
                    res.locals.imageURL = imageURL;
                    res.locals.imageName = bb.fileName;
                    next();
                }
            }else{
                res.locals.imageName = undefined;
                next();
            }
        }else{
            //sending an error status code
            res.sendStatus(bb.status);
        }
    })
    req.pipe(bb);
}

function verifyGameInputs(req,res,next){
    let {title,price,stock,type} = req.query;
    price = parseInt(price);
    stock = parseInt(stock);
    const invalid =     typeof title === "undefined" ||
                        typeof price === "undefined" ||
                        isNaN(price) ||
                        typeof stock === "undefined" ||
                        isNaN(stock) ||
                        typeof type === "undefined"||
                        title === ""||
                        type === ""||
                        price === ""||
                        stock === "";
                        
    if (invalid) res.sendStatus(400);
    else next();
}

module.exports = {api_verifyAdmin_middleware,webpage_verifyAdmin_middleware,
                image_upload_middleware,
                verifyGameInputs,
                noLoggedUserAllowed,onlyNormalUsersAllowed,anyLoggedUser,
                unverifiedUsers};
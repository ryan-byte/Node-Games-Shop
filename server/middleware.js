const jwt = require("jsonwebtoken");
const cookie = require("cookie");
const Busboy = require("busboy");
const fs = require("fs");
const path = require("path");
const randomName = require("./utils/randomName");
const fireBaseStorage = require("./utils/firebaseStorage");

const secretKey = process.env.jwtSecretKey;
const maxImgUploadSize = parseInt(process.env.maxImgUploadSize) || 5000000;

//the difference between this function and the server_verifyAdmin is:
//api function sends an unauth status code
//server function redirect to the /adminLogin route  

function api_verifyAdmin_middleware(req,res,next){
    //get jwt token
    let jwtCookie = cookie.parse(req.headers.cookie || "");
    let token = jwtCookie.jwt;
    if (token){
        try{
            let decode = jwt.verify(token,secretKey);
            res.locals.username = decode.username;
            next();
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
    let token = jwtCookie.jwt;
    if (token){
        try{
            jwt.verify(token,secretKey);
            next();
        }catch (err){
            res.status(302).redirect("/adminLogin")
        }
    }else{
        res.status(302).redirect("/adminLogin");
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
                verifyGameInputs};
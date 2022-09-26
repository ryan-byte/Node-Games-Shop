const jwt = require("jsonwebtoken");
const cookie = require("cookie");
const Busboy = require("busboy");

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
    bb.totalSize = 0;
    bb.status = 200;
    bb.on("file",(name,file,info)=>{
        const {mimeType} = info;
        if (mimeType !== "image/jpeg" && mimeType !== "image/png"){
            bb.status = 415;
        }
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
        if (bb.status === 200){
            next();
        }else{
            res.sendStatus(bb.status);
        }
    })
    req.pipe(bb);
}

module.exports = {api_verifyAdmin_middleware,webpage_verifyAdmin_middleware,
                image_upload_middleware};
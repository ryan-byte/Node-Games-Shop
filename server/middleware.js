const jwt = require("jsonwebtoken");
const cookie = require("cookie");
const Busboy = require("busboy");
const randomName = require("./utils/randomName");
const fireBaseStorage = require("./utils/firebaseStorage");
const database = require("./database/database");
const {getTokens,getGoogleUser} = require("./utils/gmailOpenID");

const antiForgeryCookieName = "state";
const accessCookieName = "login";
const userVerificationCookieName = "verification";
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
            console.log(err);
        }
    }else{
        res.sendStatus(403);
    }
}

function add_new_image_upload_middleware(req,res,next){
    //this middleware will raise a 400 error code on error
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
        if (bb.fileBase64.length === 0){
            res.sendStatus(400);
            return;
        }
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
function upadte_image_upload_middleware(req,res,next){
    //this middleware will not raise an error when there is no file uploaded
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

function verifyPostGameInputs(req,res,next){
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

function verifyGetGameInputs(req,res,next){
    let {start,limit} = req.query;
    start = parseInt(start);
    limit = parseInt(limit);
    const invalid = typeof start === "undefined" ||
                    isNaN(start) ||
                    typeof limit === "undefined" ||
                    isNaN(limit);
                        
    if (invalid) res.sendStatus(400);
    else next();
}

function verifyLogsInputs(req,res,next){
    let {start,limit,username,type} = req.query;
    start = parseInt(start);
    limit = parseInt(limit);
    const invalid = typeof start === "undefined" ||
                    isNaN(start) ||
                    typeof limit === "undefined" ||
                    isNaN(limit)||
                    typeof username === "undefined"||
                    typeof type === "undefined";
                        
    if (invalid) res.sendStatus(400);
    else next();
}

//openID middleware
function confirmAntiForgeryState(req,res,next){
    let state = req.query.state;
    let cookies = cookie.parse(req.headers.cookie || "");
    let cookieState = cookies[antiForgeryCookieName];
    if (state === cookieState){
        next();
    }else{
        res.send({error:"Anti forgery detected"});
    }
}
async function googleConnect_redirect_middleware(req,res,next){
    try{
        //get the code from the url query
        const code = req.query.code;
        if (code === undefined){
            throw new Error("code undefined");         
        }
        //get the tokens from the given code
        const {id_token, access_token} = await getTokens(code);
        //get the user infos
        let userInfo =await getGoogleUser(access_token,id_token);
        //check if the user already exist and if it in a normal user or google user
        let output = await database.openID_userExist("google",userInfo.email)
        if (output.userCanBeCreated){
            //save the user info in the database
            let objectID = await database.openID_saveUser("google",userInfo.id,userInfo.email,userInfo.name);
            if (objectID["error"]){
                res.sendStatus(502);
                return;
            }
            //add userID and username to the response local
            res.locals.userID = objectID.userID;
            res.locals.username = userInfo.name;
            next();
        }else if (output.canLogin){
            //get the user objectID
            let objectID = await database.openID_userLogin("google",userInfo.id,userInfo.email,userInfo.name);
            if (objectID["error"]){
                res.sendStatus(502);
                return;
            }
            //add userID and username to the response local
            res.locals.userID = objectID.userID;
            res.locals.username = userInfo.name;
            next();
        }else{
            //send a message that the user email already exists
            res.send("cannot login with google (account already exists)");
        }
    }catch(error){
        res.sendStatus(400);
    }
}


module.exports = {api_verifyAdmin_middleware,webpage_verifyAdmin_middleware,
                add_new_image_upload_middleware,upadte_image_upload_middleware,
                verifyPostGameInputs,verifyLogsInputs,verifyGetGameInputs,
                noLoggedUserAllowed,onlyNormalUsersAllowed,anyLoggedUser,
                unverifiedUsers,
            
                googleConnect_redirect_middleware,confirmAntiForgeryState};
const jwt = require("jsonwebtoken");
const cookie = require("cookie");

const secretKey = process.env.jwtSecretKey;

//the difference between this function and the server_verifyAdmin is:
//api function sends an unauth status code
//server function redirect to the /adminLogin route  

function api_verifyAdmin_middlware(req,res,next){
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

function webpage_verifyAdmin_middlware(req,res,next){
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

module.exports = {api_verifyAdmin_middlware,webpage_verifyAdmin_middlware};
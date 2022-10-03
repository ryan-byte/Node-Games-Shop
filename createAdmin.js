//now all the env variables can be used in all scripts
require('dotenv').config({path:__dirname+'/config.env'});

//upload the required packages
const crypto = require("crypto");
const readLine = require("readline");
const hashPassword = require("./server/utils/hashPassword");
const {createAdmin,getAdmin} = require("./server/database/database");

const rl = readLine.createInterface({
    input: process.stdin,
    output: process.stdout
})

async function main(){
    let hashKey = crypto.randomBytes(16).toString("hex");
    rl.question("username:",async username=>{
        let exists = await getAdmin(username);
        if (exists){
            console.log("admin already exists");
            rl.close();
        }
        rl.question("password:",password=>{
            rl.question("confirm password:",async confirmPassword=>{
                if (password === confirmPassword){
                    let hashedPassword = hashPassword(password,hashKey);
                    let dbResponse = await createAdmin(username,hashedPassword,hashKey);
                    if (dbResponse){
                        console.log("admin created");
                    }else{
                        console.log("something went wrong");
                    }
                }else{
                    console.log("Password and confirm password does not match");
                }
                rl.close();
            })
        })
    })
    rl.on("close",()=>{
        process.exit();
    })
}
main();
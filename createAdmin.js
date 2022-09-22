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
                    await createAdmin(username,hashedPassword,hashKey);
                }
                console.log("done saved");
                rl.close();
            })
        })
    })
    rl.on("close",()=>{
        process.exit();
    })
}
main();
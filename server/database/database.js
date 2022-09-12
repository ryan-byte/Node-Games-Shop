const fs = require("fs");

const path = __dirname + "/database.json";


const getAllData = ()=>{
    let allData = fs.readFileSync(path,"utf-8");
    return JSON.parse(allData);
}
const getOneData = (id)=>{
    let jsonAllData = JSON.parse(fs.readFileSync(path,"utf-8"));
    for (let data of jsonAllData){
        if (data.id == id){
            return data;
        }
    }
    return -1;
}
const addData = (newData)=>{
    let currentJsonData = getAllData();
    newData.id = currentJsonData.length;
    currentJsonData.push(newData);
    currentJsonData = JSON.stringify(currentJsonData,null,4);
    fs.writeFileSync(path,currentJsonData,"utf-8");
}
const updateData = (id,newData)=>{
    let jsonAllData = JSON.parse(fs.readFileSync(path,"utf-8"));
    for (let i =0; i<jsonAllData.length; i++){
        if (jsonAllData[i].id == id){
            newData.id = parseInt(id);
            jsonAllData[i] = newData;
            jsonAllData = JSON.stringify(jsonAllData,null,4);
            fs.writeFileSync(path,jsonAllData,"utf-8");
            return 1;
        }
    }
    return -1;
}
const deleteData = (id)=>{
    let jsonAllData = JSON.parse(fs.readFileSync(path,"utf-8"));
    for (let i =0; i<jsonAllData.length; i++){
        if (jsonAllData[i].id == id){
            jsonAllData.splice(i,1);
            jsonAllData = JSON.stringify(jsonAllData,null,4);
            fs.writeFileSync(path,jsonAllData,"utf-8");
            return 1;
        }
    }
    return -1;
}

module.exports = {getAllData,getOneData,addData,updateData,deleteData};
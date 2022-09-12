const database = require("../database/database");


function admin_postProduct(req,res){
    let title = req.query.title;
    let price = req.query.price;
    if (title == undefined || price == undefined || isNaN(price)){
        res.sendStatus(400);
    }else{
        database.addData({title,price})
        res.sendStatus(201);
    }
}
function admin_updateProduct(req,res){
    let title = req.query.title;
    let price = req.query.price;
    let id = req.params.id;

    if (title == undefined || price == undefined || isNaN(price)){
        res.sendStatus(400);
    }else {
        let data = database.updateData(id,{title,price});
        if (data == -1){
            res.sendStatus(404);

        }else{
            res.sendStatus(200);
        }
    }
}
function admin_deleteProduct(req,res){
    let id = req.params.id;
    if (database.deleteData(id) == -1){
        res.sendStatus(404);
    }else{
        res.sendStatus(200)
    }
}

module.exports = {admin_postProduct,admin_updateProduct,admin_deleteProduct}
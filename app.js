const express = require("express");
const app = express();
const api_routes = require("./api/apiProductRoutes");
const server_routes = require("./server/routes");
const PORT = 3000;

//make the assets folder public
app.use(express.static('./server/assets'));

//api
app.get("/api/products",api_routes.api_getAllProducts);
app.get("/api/products/:id",api_routes.api_getOneProduct);


//website routes
app.get("/search",(req,res)=>{
    server_routes.getHomepage(req,res);
})


app.listen(PORT, ()=>console.log("server is on 127.0.0.1:" + PORT))
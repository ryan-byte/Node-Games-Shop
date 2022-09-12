const express = require("express");
const app = express();
const api_routes = require("./api/apiGameRoutes");
const server_routes = require("./server/routes");
const PORT = 3000;

//make the assets folder public
app.use(express.static('./server/assets'));

//api
app.get("/api/games",api_routes.api_getAllgames);
app.get("/api/games/:id",api_routes.api_getOnegame);


//website routes
app.get("/search",(req,res)=>{
    server_routes.getHomepage(req,res);
})


app.listen(PORT, ()=>console.log("server is on 127.0.0.1:" + PORT))
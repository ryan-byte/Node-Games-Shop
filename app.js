const express = require("express");
const app = express();
const api_routes = require("./api/apiGameRoutes");
const rateLimiter_Middleware = require("./api/apiRateLimiter");
const server_routes = require("./server/routes");
const PORT = 3000;

//make the assets folder public
app.use(express.static('./server/assets'));

//api
app.get("/api/games",rateLimiter_Middleware(),api_routes.api_getAllgames);
app.get("/api/games/:title",rateLimiter_Middleware(),api_routes.api_getGameByTitle);
app.post("/api/games",rateLimiter_Middleware(),api_routes.api_addGame);
app.delete("/api/games/:id",rateLimiter_Middleware(),api_routes.api_removeGame);
app.put("/api/games/:id",rateLimiter_Middleware(),api_routes.api_updateGame);


//website routes
app.get("/",(req,res)=>{
    server_routes.getHomepage(req,res);
})


app.listen(PORT, ()=>console.log("server is on 127.0.0.1:" + PORT))
const express = require("express");
const app = express();
const api_routes = require("./api/apiGameRoutes");
const rateLimiter_Middleware = require("./api/apiRateLimiter");
const server_routes = require("./server/routes");
const server_middleware = require("./server/middleware")
const PORT = 3000;

//make the assets folder public
app.use(express.static('./server/assets'));

//public api
app.get("/api/games",rateLimiter_Middleware(),
                    api_routes.api_getAllgames);
app.get("/api/games/:title",rateLimiter_Middleware(),
                    api_routes.api_getGameByTitle);
//admins api
app.post("/api/games",rateLimiter_Middleware(),
                    server_middleware.api_verifyAdmin_middlware,
                    api_routes.api_addGame);
app.delete("/api/games/:id",rateLimiter_Middleware(),
                    server_middleware.api_verifyAdmin_middlware,
                    api_routes.api_removeGame);
app.put("/api/games/:id",rateLimiter_Middleware(),
                    server_middleware.api_verifyAdmin_middlware,
                    api_routes.api_updateGame);


//website routes
app.get("/",(req,res)=>{
    server_routes.getHomepage(req,res);
})

app.get("/adminLogin",server_routes.getAdminLogin);
app.post("/adminLogin",server_routes.postAdminLogin);

app.get("/adminPanel",server_middleware.webpage_verifyAdmin_middlware,
                    server_routes.getAdminPanel)

app.listen(PORT, ()=>console.log("server is on 127.0.0.1:" + PORT))
//now all the env variables can be used in all scripts
require('dotenv').config({path:__dirname+'/config.env'});

//upload the required packages
const express = require("express");
const app = express();
const api_routes = require("./api/apiGameRoutes");
const rateLimiter_Middleware = require("./api/apiRateLimiter");
const server_routes = require("./server/routes");
const server_middleware = require("./server/middleware")
const PORT = process.env.PORT || 8080;

app.use(express.urlencoded({ extended: true }));

//make the assets folder public
app.use(express.static('./server/assets'));

//public api
app.get("/api/games",rateLimiter_Middleware(),
                    api_routes.api_getAllgames);
app.get("/api/games/id/:ids",rateLimiter_Middleware(),
                    api_routes.api_getMultipleGamesByID);
app.get("/api/games/:title",rateLimiter_Middleware(),
                    api_routes.api_getGameByTitle);
//admins api
app.post("/api/games",rateLimiter_Middleware(),
                    server_middleware.api_verifyAdmin_middleware,
                    server_middleware.image_upload_middleware,
                    api_routes.api_addGame);
app.delete("/api/games/:id",rateLimiter_Middleware(),
                    server_middleware.api_verifyAdmin_middleware,
                    api_routes.api_removeGame);
app.put("/api/games/:id",rateLimiter_Middleware(),
                    server_middleware.api_verifyAdmin_middleware,
                    server_middleware.image_upload_middleware,
                    api_routes.api_updateGame);
app.get("/api/orders/:verificationStatus",rateLimiter_Middleware(),
                    server_middleware.api_verifyAdmin_middleware,
                    api_routes.api_getOrder);
app.put("/api/verifyOrder/:orderID",rateLimiter_Middleware(),
                    server_middleware.api_verifyAdmin_middleware,
                    api_routes.api_verifyOrder);
app.put("/api/declineOrder/:orderID",rateLimiter_Middleware(),
                    server_middleware.api_verifyAdmin_middleware,
                    api_routes.api_declineOrder);


//website routes
app.get("/",(req,res)=>{
    server_routes.getHomepage(req,res);
})

app.get("/order",server_routes.getOrderPage);
app.post("/order",server_routes.postOrder);

app.get("/adminLogin",server_routes.getAdminLogin);
app.post("/adminLogin",server_routes.postAdminLogin);

app.get("/adminpanel",server_middleware.webpage_verifyAdmin_middleware,
                    server_routes.getadminpanel);
app.get("/adminpanel/add",server_middleware.webpage_verifyAdmin_middleware,
                    server_routes.getadminpanelAddGame);

app.get("/adminpanel/order",server_middleware.webpage_verifyAdmin_middleware,
                            server_routes.getadminpanelOrderList);

app.post("/adminpanel/logout",server_middleware.webpage_verifyAdmin_middleware,
                    server_routes.adminLogout);

app.listen(PORT, ()=>console.log("server is on 127.0.0.1:" + PORT))
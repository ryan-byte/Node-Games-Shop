//now all the env variables can be used in all scripts
require('dotenv').config({path:__dirname+'/config.env'});
require('dotenv').config({path:__dirname+'/gmailOpenID.env'});

//upload the required packages
const express = require("express");
const url = require("url");
const app = express();

const api_routes = require("./api/apiGameRoutes");
const rateLimiter_Middleware = require("./api/apiRateLimiter");
const server_routes = require("./server/routes");
const server_middleware = require("./server/middleware")

const PORT = process.env.PORT || 8080;
const redirectURIcomponned = new url.URL(process.env.redirectURL).pathname;

app.use(express.urlencoded({ extended: true }));

//make the public assets folder public
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
                    server_middleware.verifyGameInputs,
                    server_middleware.api_verifyAdmin_middleware,
                    server_middleware.image_upload_middleware,
                    api_routes.api_addGame);
app.put("/api/games/:id",rateLimiter_Middleware(),
                    server_middleware.verifyGameInputs,
                    server_middleware.api_verifyAdmin_middleware,
                    server_middleware.image_upload_middleware,
                    api_routes.api_updateGame);
                    
app.delete("/api/games/:id",rateLimiter_Middleware(),
                    server_middleware.api_verifyAdmin_middleware,
                    api_routes.api_removeGame);

app.get("/api/orders/:verificationStatus",rateLimiter_Middleware(),
                    server_middleware.api_verifyAdmin_middleware,
                    api_routes.api_getOrder);
app.put("/api/verifyOrder/:orderID",rateLimiter_Middleware(),
                    server_middleware.api_verifyAdmin_middleware,
                    api_routes.api_verifyOrder);
app.put("/api/declineOrder/:orderID",rateLimiter_Middleware(),
                    server_middleware.api_verifyAdmin_middleware,
                    api_routes.api_declineOrder);

//normal users api
app.get("/api/user/getOrders",rateLimiter_Middleware(),
                    server_middleware.onlyNormalUsersAllowed,
                    api_routes.api_getLatestOrders);

app.get("/api/user/getInfos",rateLimiter_Middleware(),
                    server_middleware.onlyNormalUsersAllowed,
                    api_routes.api_getAllUserDeliveryInfo);

app.get("/api/user/getSpecificInfo",rateLimiter_Middleware(),
                    server_middleware.onlyNormalUsersAllowed,
                    api_routes.api_getSpecificUserDeliveryInfo);

//public pages
app.get("/",(req,res)=>{
    server_routes.getHomepage(req,res);
});
app.get("/removeVerificationCookie",server_routes.removeVerificationCookie);

//no logged user allowed 
app.get("/adminLogin",server_middleware.noLoggedUserAllowed,server_routes.getAdminLogin);
app.post("/adminLogin",server_middleware.noLoggedUserAllowed,server_routes.postAdminLogin);

app.get("/userLogin",server_middleware.noLoggedUserAllowed,server_routes.getUserLogin);
app.post("/userLogin",server_middleware.noLoggedUserAllowed,server_routes.postUserLogin);

app.get("/userSignup",server_middleware.noLoggedUserAllowed,server_routes.getUserSignup);
app.post("/userSignup",server_middleware.noLoggedUserAllowed,server_routes.postUserSignup);

app.get("/openID/gmail",server_middleware.noLoggedUserAllowed,server_routes.openIDConnect_gmail_login);
app.get(`${redirectURIcomponned}`,server_middleware.noLoggedUserAllowed,
                        server_middleware.confirmAntiForgeryState,
                        server_middleware.googleConnect_redirect_middleware,
                        server_routes.googleConnect_redirect);

//only users with the unverified cookie
app.get("/userVerification",server_middleware.unverifiedUsers,server_routes.getVerificationPage);
app.post("/userVerification",server_middleware.unverifiedUsers,server_routes.postVerificationPage);

//any logged user
app.post("/logout",server_middleware.anyLoggedUser,
                    server_routes.logout);

//normal allowed users pages
app.get("/order/information",server_middleware.onlyNormalUsersAllowed,server_routes.getDeliveryInfoSelect);

app.post("/order/information/select",server_middleware.onlyNormalUsersAllowed,
                    server_routes.selectDeliveryInfo);

app.get("/order/confirmation",server_middleware.onlyNormalUsersAllowed,
                        server_routes.getOrderConfirmationPage);
app.post("/order/confirmation",server_middleware.onlyNormalUsersAllowed,
                        server_routes.postOrder);

app.get("/order/information/add",server_middleware.onlyNormalUsersAllowed,
                    server_routes.getDeliveryInfoAdd);
app.post("/order/information/add",server_middleware.onlyNormalUsersAllowed,
                    server_routes.postDeliveryInfoAdd);

app.get("/order/information/edit",server_middleware.onlyNormalUsersAllowed,
                    server_routes.getDeliveryInfoEdit);

app.get("/userOrders",server_middleware.onlyNormalUsersAllowed,
                    server_routes.getUserOrdersHistoryPage);

//admin allowed pages
app.get("/adminpanel",server_middleware.webpage_verifyAdmin_middleware,
                    server_routes.getadminpanel);
app.get("/adminpanel/add",server_middleware.webpage_verifyAdmin_middleware,
                    server_routes.getadminpanelAddGame);

app.get("/adminpanel/order",server_middleware.webpage_verifyAdmin_middleware,
                            server_routes.getadminpanelOrderList);


app.listen(PORT, ()=>{
    console.log("\x1b[33m" + "server is on port " + PORT + "\x1b[0m");
    console.log("Setting up Database");
});
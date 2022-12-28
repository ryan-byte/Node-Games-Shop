# Games-Shop

### Overview:
-This web application is a <b> personnal project </b> that is used to serve and order games, built with NodeJS, Express, MongoDB, HTML, CSS, JS, Bootstrap, Firebase storage (for storing images in the cloud), gmail (for sending verification code on signup).


### Features:
-Users can view games <br>
-Users can order games <br>
-Users can signup/login <br>
-Users must verify their account by typing a verification code that has been sent to their email <br>
-Users can also login with google openID <br>
-Users can track their own orders <br>
-Admins can create, update and delete games  <br>
-Admins can view sales history for games <br>
-Admins can view all orders <br>
-Admins can verify or decline orders <br>
-Admins can see logs <br>
-Created games images are stored in the cloud <br>


<h1> view live: <a href="https://game-shop.onrender.com/"> game-shop </a></h1>

<h1> setup locally </h1>

#### Requirements:
1. Nodejs
2. Firebase storage (used for saving images in the cloud).
3. <a href = "https://support.google.com/cloud/answer/6158849?hl=en">Google Oauth2.0 </a> (used to setup google openid connect).
4. Generate gmail app password for Mail and save it (<a href = "https://support.google.com/mail/answer/185833?hl=en">guide</a>).


#### Adding env config:
1. Create `config.env` using template from `config.env.example` .
2. Create `emailAuth.env` using template from `emailAuth.env.example` .
3. Create `firebaseConfig.env` using template from `firebaseConfig.env.example` .
4. Create `gmailOpenID.env` using template from `gmailOpenID.env.example` .


### How to Run the Project:
- Open the terminal or cmd at the project directory then run:
```
npm i
```
- To start the project run:
```
npm start
```
- Visit `localhost:8080` (if the PORT = 8080)


### How to create an admin user:
- Open the terminal or cmd at the project directory then run:
```
node createAdmin.js
```
- Input the username 
- Input the password 
- Input the confirm password

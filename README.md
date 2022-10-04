# Games-Shop

##### Table of Contents  
[Overview](#overview) <br>
[Features](#features) <br>
[Setup Project](#setup) <br>
[Run Project](#run) <br>
[Create Admin](#createAdmin) <br>
[Roadmap](#roadmap) <br>


<a name="overview"/>

### Overview:
-This web application is a <b> personnal project </b> that is used to order games online, built with NodeJS, Express, MongoDB, HTML, CSS, JS, Bootstrap.

<a name="features"/>

### Features:
-Users can view games <br>
-Users can order games <br>
-Admins can create, update and delete games  <br>
-Admins can view all orders <br>
-Admins can verify or decline orders <br>
-Log admin action <br>

<a name="setup"/>

### Setup:
- Install nodejs from https://nodejs.org/en/download/
- Open the terminal or cmd at the project directory then run:
```
$ npm i
```
- Add config.env file to the project folder, then add the following:
```
PORT = <integer>
jwtSecretKey = <string>
mongoURL = <mongodb atlas connect url>
digestAlgorithm = <crypto digest algorithm>
apiRequestsPerMin = <integer> 
maxImgUploadSize = <integer>
```
#### config.env variables
###### PORT (OPTIONAL)
Port used by the server (default value 3000)
###### jwtSecretKey (REQUIRED)
A secret key that is used to sign jwt tokens this key should never be exposed (no default value)
###### mongoURL (REQUIRED)
1. Create a Database in mongodb atlas
2. Press on connect > connect your application > copy the connection string
3. Paste the connection string in the `mongoURL` variable
4. Replace `<password>` with the Database Access user password.
###### digestAlgorithm (OPTIONAL)
Change the digest algorithm that is used for hashing password (default value sha256)
###### apiRequestsPerMin (OPTIONAL)
Max number of API requests a user can make per minute (default value 60)
###### maxImgUploadSize (OPTIONAL)
Max size of the image file for a game (default 5000000 in bytes = 5mb)


<a name="run"/>

### How to Run the Project:
- To start the server open the terminal or cmd at the project directory then run:
```
$ npm start
```
- Visit the app at (if the PORT = 3000):
```
127.0.0.1:3000
```

<a name="createAdmin"/>

### How to create an admin user:
- Open the terminal or cmd at the project directory then run:
```
$ node createAdmin.js
```
- Input the username 
- Input the password 
- Input the confirm password


<a name="roadmap"/>

### Roadmap:
#### Foundation

- [x] public get api for games
- [x] limit the get api requests to 60 per min (use bucket token algorithm) note: make sure to store bucket token in Redis in production
- [x] save games in mongodb
- [x] admin register script that cannot be accessed which will create an admin user (must use password hashing)
- [x] create games post/update/delete api (can only be accessed by admins)
- [x] create admin login page
- [x] add admin authorization token to the games post/update/delete api (secure cookies)
- [x] admin panel frontend (search games/ update game/ delete game/ add new game)
- [x] admin panel logout
- [x] admin login verification
- [x] log admin actions
- [x] secure the backend code for admin login
- [x] use dotenv code to seperate secret informations from the source code
- [x] rendering games (frontend)
- [x] make the admin panel simpler for development
- [x] orders cart (client)
- [x] order (client) 
- [x] verify order (backend)
- [x] admin verification of the order (admin panel) 
- [x] update the README file


#### Features
- [ ] frontend overhaul
- [ ] can add quantity in the cart
- [ ] blacklist ip if the admin password is wrong for few times
- [ ] make the api requests limiter store in Redis instead of memory
- [ ] make the game type selectable + verification
- [ ] request timeout security
- [ ] user register
- [ ] login page for users/admin
- [ ] limit the number of games loaded and more will be loaded when scrolling down


#### Production
- [ ] polish the frontend
- [ ] clean the backend code
- [ ] secure the backend code
- [ ] change the api request limiter to work in redis cache instead of memory
- [ ] after adding SSL certificate for encrypted connection make sure to set every cookie flag to secure
- [ ] store the images in a cloud storage

#### Notes:

- **dont use localStorage and sessionStorage to store jwt they are vulnerable to XSS attack**
- **cookies are a possibility to store tokens but to protect from XSS attack use `httponly` option in cookies**
- **cookies are vulnerable to CSRF attack to prevent this set the following option  `sameSite` to `Strict`**
- **cookies security blog:** https://tkacz.pro/how-to-securely-store-jwt-tokens/

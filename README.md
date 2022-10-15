# Games-Shop

##### Table of Contents  
[Overview](#overview) <br>
[Features](#features) <br>
[Setup Project](#setup) <br>
[Setup gmail app password](#setupgmailapp) <br>
[Run Project](#run) <br>
[Create Admin](#createAdmin) <br>
[Roadmap](#roadmap) <br>


<a name="overview"/>

### Overview:
-This web application is a <b> personnal project </b> that is used to server and order games online, built with NodeJS, Express, MongoDB, HTML, CSS, JS, Bootstrap, Firebase storage (for storing images), gmail (for sending mails to verify users signup)

<a name="features"/>

### Features:
-Users can view games <br>
-Users can order games <br>
-Users can signup/login <br>
-Users can login with google openID <br>
-Users must verify their account by typing a verification code that has been sent to their email <br>
-Users can track their own orders <br>
-Admins can create, update and delete games  <br>
-Admins can view all orders <br>
-Admins can verify or decline orders <br>
-Log admin action <br>
-Created games images are stored in the cloud <br>

<a name="setup"/>

### Setup:
- Install nodejs from https://nodejs.org/en/download/
- <b>Step 1</b>: Open the terminal or cmd at the project directory then run:
```
npm i
```
- <b>Step 2</b>: Add `config.env` file to the project folder, then add the following:
```
PORT = <integer>
jwtSecretKey = <string>
mongoURL = <mongodb atlas connect url>
digestAlgorithm = <crypto digest algorithm>
apiRequestsPerMin = <integer> 
maxImgUploadSize = <integer>
unverifiedUserDataExpirationTimeInSec = <integer>
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
###### unverifiedUserDataExpirationTimeInSec (OPTIONAL)
Time for the unverified user to be deleted from the database, also used as an expiration time for verification cookie (default 1800)


- <b>Step 3</b>: Create a firebase account > create a firebase project > create a firebase web app > copy the firebaseConfig variable content it looks like this <br>

```
const firebaseConfig = {
  apiKey: "AsdqzdSDzaqsd468",
  authDomain: "myProjectID.firebaseapp.com",
  projectId: "myProjectID",
  storageBucket: "myProjectID.appspot.com",
  messagingSenderId: "6511211234525",
  appId: "8:213514:61qsd54zqd321:4984365467",
  measurementId: "QZ-SQDZQSDZ651"
};
```

- <b>Step 4</b>: Create `firebaseConfig.env` in the app root directory, then add the following:
```
apiKey = <replace it with the right value>
authDomain = <replace it with the right value>
projectId = <replace it with the right value>
storageBucket = <replace it with the right value>
messagingSenderId = <replace it with the right value>
appId = <replace it with the right value>
measurementId = <replace it with the right value>
```
Then replace each variable with the right value from `const firebaseConfig` that we copied in the previous step

<br>
🛑By default the server uses firebase storage for storing images in the cloud (free no credit card required). if you'd like to use local storage instead of a cloud storage you can use the <b> main-v1.0-(local-storage) </b>branch <b> (Note: main-v1.0-(local-storage) branch will no longer be updated) </b> <br>

🟠If you want to use a different cloud storage you should modify the script `server/utils/firebaseStorage.js` <br>


- <b>Step 5</b>: Create `emailAuth.env` in the app root directory, then add the following:
```
service = <string>
mail = <string>
appPassword = <string>
```
###### service (OPTIONAL)
The service used as an email provider (default "gmail")
###### mail (REQUIRED)
The Address mail used for sending the validation code for validating user signup
###### appPassword (REQUIRED)
For gmail service you should setup an app password (follow these [steps](#setupgmailapp))


<a name = "setupgmailapp"/>

### Setup gmail app password:
- First we have to  <a href = "https://myaccount.google.com/signinoptions/two-step-verification/enroll-welcome">enable 2-Step Verification.</a>
- Now select the <a href = "https://myaccount.google.com/u/2/apppasswords"> App passwords </a> option and generate a password, that's it.  

- <b>Step 6</b>: Create `gmailOpenID.env` in the app root directory, then add the following:
```
clientID = <string>
clientSecret = <string>
redirectURL = <string>
```
Follow this <a href = "https://support.google.com/cloud/answer/6158849?hl=en"> guide </a> to create an oauth client, make sure to add an authorized redirect URI then copy it in the redirectURL field (redirect URI example `http://localhost:3000/openID/google`, make sure you dont set it to an already existing endpoint, to see all endpoints see the app.js).<br>
After creating an oauth client and setting up the redirectURL get the clientID and clientSecret by visiting this  <a href = https://console.cloud.google.com/apis/credentials> page</a>, selecting the created client oauth, you should see the clientID with the secret on the top right of the page.


<a name="run"/>

### How to Run the Project:
- To start the server open the terminal or cmd at the project directory then run:
```
npm start
```
- Visit the app at `127.0.0.1:3000` (if the PORT = 3000)

<a name="createAdmin"/>

### How to create an admin user:
- Open the terminal or cmd at the project directory then run:
```
node createAdmin.js
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
- [x] make it responsive
- [x] can add quantity in the cart
- [ ] blacklist ip if the admin password is wrong for few times
- [ ] make the game type selectable + verification
- [x] user register
- [x] user register verification by sending email
- [x] login/register with google openID
- [x] login page for users/admin
- [x] users can track their orders
- [ ] limit the number of games loaded and more will be loaded when scrolling down


#### Production
- [ ] polish the frontend
- [ ] clean the backend code
- [ ] secure the backend code
- [ ] change the api request limiter to work in redis cache instead of memory
- [ ] after adding SSL certificate for encrypted connection make sure to set every cookie flag to secure
- [x] store the images in a cloud storage

#### Notes:

- **dont use localStorage and sessionStorage to store jwt they are vulnerable to XSS attack**
- **cookies are a possibility to store tokens but to protect from XSS attack use `httponly` option in cookies**
- **cookies are vulnerable to CSRF attack to prevent this set the following option  `sameSite` to `Strict`**
- **cookies security blog:** https://tkacz.pro/how-to-securely-store-jwt-tokens/

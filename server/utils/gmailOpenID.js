const path = require("path");
const axios = require("axios");
require('dotenv').config({path:path.resolve(__dirname,"..","..","gmailOpenID.env")});

const clientID = process.env.clientID;
const clientSecret = process.env.clientSecret;
const redirectURL = process.env.redirectURL;


function getGoogleAuthURL() {
    const rootUrl = "https://accounts.google.com/o/oauth2/v2/auth";
    const options = {
    redirect_uri: redirectURL,
    client_id: clientID,
    access_type: "offline",
    response_type: "code",
    prompt: "consent",
    scope: [
        "https://www.googleapis.com/auth/userinfo.profile",
        "https://www.googleapis.com/auth/userinfo.email",
    ].join(" "),
    };
    let optionsQuery = new URLSearchParams(options).toString();
    return `${rootUrl}?${optionsQuery}`;
}
function getTokens(code){
    const url = "https://oauth2.googleapis.com/token";
    const values = {
      code,
      client_id: clientID,
      client_secret: clientSecret,
      redirect_uri: redirectURL,
      grant_type: "authorization_code",
    };

    return axios.post(url, new URLSearchParams(values).toString(), {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
    })
    .then((res) => res.data)
    .catch((error) => {
      console.error(`Failed to fetch auth tokens`);
      throw new Error(error.message);
    });
}
function getGoogleUser(access_token,id_token){
  return axios.get(
    `https://www.googleapis.com/oauth2/v1/userinfo?alt=json&access_token=${access_token}`,
    {
      headers: {
        Authorization: `Bearer ${id_token}`,
      },
    }
  )
  .then((res) => res.data)
  .catch((error) => {
    console.error(`Failed to fetch user`);
    throw new Error(error.message);
  });
}

module.exports = {getGoogleAuthURL,getTokens,getGoogleUser};
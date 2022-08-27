require("dotenv").config();
const {google: googleapis} = require("googleapis");
const fsPromises = require('fs').promises;
const readline = require('readline');

let REFRESH_TOKEN = process.env.REFRESH_TOKEN;
let ACCESS_TOKEN = process.env.ACCESS_TOKEN;
const TOKEN_PATH = process.env.TOKEN_PATH;

const scopes = [
  //"https://www.googleapis.com/auth/drive",  //See, edit, create, and delete all or your drive files
  //"https://www.googleapis.com/auth/drive.file",  //See, edit, create, and delete only the specific Google Drive files you use with this app
  "https://www.googleapis.com/auth/spreadsheets",  //See, edit, create, all your Google sheets spreadsheets
];
const discoveryDocs = ["https://sheets.googleapis.com/$discovery/rest?version=v4"];

//create helper function to retrieve authorization credentials stored outside of version control
const fetchAuthCredentials = ()=>{
  console.info("Fetching authorization credentials...");

  try {
    //Get & return the credentials from localStorage
    const creds = JSON.parse(localStorage.getItem("creds"));
    if (creds && creds.clientId) return creds;

    //If proper credentials weren't found, throw
    const CredentialsNotFoundError = new Error("Failed to get authorization credentials.")
    CredentialsNotFoundError.name = "CredentialsNotFoundError";
    throw CredentialsNotFoundError;
  }
  catch (err) {
    throw err;
  }
};


//Load the Google Client, OAuth2.0 libraries
const initAuthorization = (loginCallback, logoutCallback)=>{
  try {
    //Attempt to get the credentials
    const creds = fetchAuthCredentials();

    //Load the Google APIs
    loadGoogleApis(creds, loginCallback, logoutCallback)

    return creds;
  }
  catch (err) {
    return throwException(err);
  }
};

const loadGoogleApis = (creds, loginCallback, logoutCallback)=>{
  try {
    console.info("Loading Google Client, OAuth2.0 APIs...");
    window.gapi.load("client:auth2", ()=>{initializeGoogleApis(creds, loginCallback, logoutCallback)});
  }
  catch (err) {
    return err;
  }
};

//Initialize Google Client library (which simultaneously initializes Google OAuth2.0 library) and set up sign in listeners
const initializeGoogleApis = async (creds, loginCallback, logoutCallback)=>{
  console.info("Loaded Google Client, OAuth2.0 APIs.");
  console.info("Initializing Google Client API...");
  const {clientId} = creds;

  //Attempt to initialize the Google API
  window.gapi.client.init({
    clientId: clientId,
    scope: scopes.join(" "), //space delimited
    discoveryDocs: discoveryDocs,
  })
  .then(()=>{
    console.info("Initialized Google Client API.");

    //Listen for sign in state changes
    window.gapi.auth2.getAuthInstance().isSignedIn.listen(
      isSignedIn => updateSigninStatus(isSignedIn, loginCallback, logoutCallback)
    );

    //Handle initial sign in state
    updateSigninStatus(window.gapi.auth2.getAuthInstance().isSignedIn.get(), loginCallback, logoutCallback);
  })
  .catch(err=>{
    return err;
  });
};

//Update UI sign in state changes
const updateSigninStatus = (isSignedIn, loginCallback, logoutCallback)=>{
  console.info("Updating sign in status...");
  if (isSignedIn) {
    // authorizeButton.style.display = "none";
    // signoutButton.style.display = "block";
    // signoutButton.removeAttribute("disabled");

    //Get profile information
    const signInInfo = getProfileInformation();

    //Run the callback functions
    if (loginCallback) loginCallback(signInInfo);
  }
  else {
    // authorizeButton.style.display = "block";
    // signoutButton.style.display = "none";

    //Run the callback functions
    if (logoutCallback) logoutCallback(null);
  }
  console.info("Updated sign in status.");
};

const signIn = async ()=>{
  try {
    await window.gapi.auth2.getAuthInstance().signIn();
  }
  catch (err) {
    return err;
  }
};

const signOut = async ()=>{
  try {
    await window.gapi.auth2.getAuthInstance().signOut();
  }
  catch (err) {
    return err;
  }
};

const getProfileInformation = ()=>{
  console.info("Getting profile info...");
  const profile = window.gapi.auth2.getAuthInstance().currentUser.get().getBasicProfile();
  if (!profile) return null;
  return {
    id: profile.getId(),
    name: profile.getName(),
    firstName: profile.getGivenName(),
    lastName: profile.getFamilyName(),
    imageUrl: profile.getImageUrl(),
    emailAddress: profile.getEmail(),
  };
};



//Create helper functions
const fetchAuthCreds = ()=>{
  /* DEBUG */ console.info(`>[${new Date().toJSON()}] [INFO] Fetching authorization credentials...`);

  try {
    //Get & return the credentials from localStorage
    // const creds = JSON.parse(localStorage.getItem("creds"));
    const creds = {
      clientId: process.env.CLIENT_ID,
      clientSecret: process.env.CLIENT_SECRET,
      redirectUrl: process.env.REDIRECT_URL,
    };

    if (creds && creds.clientId && creds.clientSecret && creds.redirectUrl) {
      /* DEBUG */ console.info(`>[${new Date().toJSON()}] [INFO] Fetched authorization credentials.`);
      return creds;
    }

    //If proper credentials weren't found, throw
    const CredentialsNotFoundError = new Error("Failed to get authorization credentials.")
    CredentialsNotFoundError.name = "CredentialsNotFoundError";
    throw CredentialsNotFoundError;
  }
  catch (err) {
    throw err;
  }
};

const getAuthConsentCode = async (oAuth2Client)=>{
  try {
    //Generate an authorization consent URL
    const authUrl = oAuth2Client.generateAuthUrl({
      access_type: 'offline',  // 'online' (default) or 'offline' (gets refresh_token)
      scope: scopes.join(" "),
    });

    //Prompt to navigate to the authorization conset URL and provide the code
    console.log('Authorize this app by visiting this url:', authUrl);
    return new Promise((resolve, reject)=>{
      try {
        const rl = readline.createInterface({
          input: process.stdin,
          output: process.stdout,
        });
        const code = rl.question("Enter the code from that page here:", (code)=>{
          /* DEBUG */ console.log(`>[${new Date().toJSON()}] [INFO] Received code "${code}".`);
          rl.close();
          resolve(code);
        });
      }
      catch (err) {
        reject(err);
      }
    });
  }
  catch (err) {
    /* DEBUG */ console.error(`>[${new Date().toJSON()}] [ERROR] Failed to get OAuth2 authorization consent code: ${err}`);
    throw err;
  }
};

const getAuthTokensFromAuthCode = async (oAuth2Client, code)=>{
  //Request an OAuth2 access and refresh token
  const {tokens} = await oAuth2Client.getToken(code);

  try {
    // Store the OAuth2 auth tokens to disk for later program executions
    try {
      await fsPromises.writeFile(TOKEN_PATH, JSON.stringify(tokens));
      /* DEBUG */ console.log(`>[${new Date().toJSON()}] [INFO] OAuth2 auth tokens written to "${TOKEN_PATH}".`);
    }
    catch (err) {
      /* DEBUG */ console.error(`>[${new Date().toJSON()}] [ERROR] Failed to write OAuth2 auth tokens to "${TOKEN_PATH}": ${err}`);
      throw err;
    }

    return tokens;
  }
  catch (err) {
    /* DEBUG */ console.error(`>[${new Date().toJSON()}] [ERROR] Failed to retrieve OAuth2 auth tokens: ${err}`);
    throw err;
  }
};

const getNewAuthTokens = async (oAuth2Client)=>{
  //Get an OAuth2 authorization consent code
  const code = await getAuthConsentCode(oAuth2Client);

  //Generate OAuth2 auth tokens using the auth consent code
  const tokens = await getAuthTokensFromAuthCode(oAuth2Client, code);

  //Return the OAuth2 auth tokens
  return tokens;
};

const getOAuth2Authorization = async ()=>{
  //Attempt to get the OAuth2 credentials
  const creds = fetchAuthCreds();

  //Create and configure an OAuth2 client
  try {
    //Get the OAuth2 credentials
    /* DEBUG */ console.info(`>[${new Date().toJSON()}] [INFO] Initializing OAuth2 client...`);
    const oAuth2Client = new googleapis.auth.OAuth2(
      creds.clientId,
      creds.clientSecret,
      creds.redirectUrl,
    );

    oAuth2Client.on('tokens', (tokens) => {
      if (tokens.refresh_token) {
        // store the refresh_token in my database!
        REFRESH_TOKEN = tokens.refresh_token;
      }
      ACCESS_TOKEN = tokens.access_token;
    });
    /* DEBUG */ console.info(`>[${new Date().toJSON()}] [INFO] OAuth2 client initialized.`);

    //If an OAuth2 refresh token is already provided, use it
    // Otherwise, generate refresh and access tokens
    let tokens;
    let refreshToken = REFRESH_TOKEN;
    let accessToken = ACCESS_TOKEN;

  /* DEBUG */ console.info(`>[${new Date().toJSON()}] [INFO] Searching for existing OAuth2 refresh token...`);
    if (refreshToken) {
      /* DEBUG */ console.info(`>[${new Date().toJSON()}] [INFO] Reusing found OAuth2 refresh token. Getting new OAuth2 access token...`);
      tokens = {
        refresh_token: refreshToken,
      };
      oAuth2Client.setCredentials(tokens);
      const { token } = await oAuth2Client.refreshAccessToken();

      tokens = {
        refresh_token: refreshToken,
        access_token: token,
      };
      /* DEBUG */ console.info(`>[${new Date().toJSON()}] [INFO] Obtained new OAuth2 access token.`);
    }
    //If no previous OAuth2 auth tokens were found, fetch new ones
    else {
      try {
        /* DEBUG */ console.info(`>[${new Date().toJSON()}] [INFO] No Outh2 refresh token found. Getting new OAuth2 auth tokens...`);
        tokens = await getNewAuthTokens(oAuth2Client);
        /* DEBUG */ console.info(`>[${new Date().toJSON()}] [INFO] Obtained new OAuth2 auth tokens.`);
      }
      catch (err) {
        /* DEBUG */ console.error(`>[${new Date().toJSON()}] [ERROR] Failed to get new OAuth2 auth tokens: ${err}`);
        throw err;
      }
    }

    //Set the OAuth2 credentials using the OAuth2 auth tokens
    try {
      /* DEBUG */ console.info(`>[${new Date().toJSON()}] [INFO] Setting OAuth2 credentials using auth tokens...`);
      oAuth2Client.setCredentials(tokens);
      /* DEBUG */ console.info(`>[${new Date().toJSON()}] [INFO] Set OAuth2 credentials using auth tokens.`);
    }
    catch (err) {
      /* DEBUG */ console.error(`>[${new Date().toJSON()}] [ERROR] Failed to set credentials using auth tokens: ${err}`);
      throw err;
    }

    /* DEBUG */ console.info(`>[${new Date().toJSON()}] [INFO] Authorized with Google APIs.`);

    //Return the OAuth2 client
    return oAuth2Client;
  }
  catch (err) {
    /* DEBUG */ console.error(`>[${new Date().toJSON()}] [ERROR] Failed to initialize OAuth2 client: ${err}`);
    throw err;
  }
};


//Create functions
const authorize = async ()=>{
  //Authorize with the Google API
  const oAuth2Client = await getOAuth2Authorization();

  //Return the OAuth2 authorization client
  return oAuth2Client;
};

module.exports = {
   authorize,
};

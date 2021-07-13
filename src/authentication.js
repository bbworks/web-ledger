const scopes = [
  "https://www.googleapis.com/auth/drive",
  "https://www.googleapis.com/auth/drive.file",
  "https://www.googleapis.com/auth/spreadsheets",
];
const discoveryDocs = ["https://sheets.googleapis.com/$discovery/rest?version=v4"];

const authorizeButton = document.querySelector("[data-gapi-signin-button]");
const signoutButton = document.querySelector("[data-gapi-signout-button]");

//create helper function to retrieve authorization credentials stored outside of version control
const fetchAuthCredentials = ()=>{
  console.info("Fetching authorization credentials...");
  const creds = localStorage.getItem("creds");
  if (!creds) throw new Error("Failed to get authorization credentials.");
  return JSON.parse(creds);
};

//Load the Google Client, OAuth2.0 libraries
export const initAuthorization = (loginCallback, logoutCallback)=>{
  try {
    //Attempt to get the credentials
    const creds = fetchAuthCredentials();

    //Load the Google APIs
    loadGoogleApis(loginCallback, logoutCallback)
  }
  catch (err) {
    const errorMsg = `The application failed.\r\n${err}`;
    console.log(errorMsg);
    window.alert(errorMsg);
    throw new Error(errorMsg);
  }
};

const loadGoogleApis = (loginCallback, logoutCallback)=>{
  console.info("Loading Google Client, OAuth2.0 APIs...");
  gapi.load("client:auth2", ()=>{initializeGoogleApis(loginCallback, logoutCallback)});
};

//Initialize Google Client library (which simultaneously initializes Google OAuth2.0 library) and set up sign in listeners
const initializeGoogleApis = (loginCallback, logoutCallback)=>{
  console.info("Loaded Google Client, OAuth2.0 APIs.");
  console.info("Initializing Google Client API...");
  gapi.client.init({
    apiKey: apiKey,
    clientId: clientId,
    scope: scopes.join(" "), //space delimited
    discoveryDocs: discoveryDocs,
  })
    .then(()=>{
      console.info("Initialized Google Client API.");
      //Listen for sign in state changes
      gapi.auth2.getAuthInstance().isSignedIn.listen(
        isSignedIn => updateSigninStatus(isSignedIn, loginCallback, logoutCallback)
      );

      //Handle initial sign in state
      updateSigninStatus(gapi.auth2.getAuthInstance().isSignedIn.get(), loginCallback, logoutCallback);

      authorizeButton.addEventListener("click", signIn);
      signoutButton.addEventListener("click", signOut);
    })
    .catch(err=>{
      console.error("Failed to initialize Google Client API.", err.error, err.details);
      // window.alert("Failed to initialize Google Client API. The application failed.", err);
    });
};

//Update UI sign in state changes
const updateSigninStatus = (isSignedIn, loginCallback, logoutCallback)=>{
  console.info("Updating sign in status...");
  if (isSignedIn) {
    authorizeButton.style.display = "none";
    signoutButton.style.display = "block";
    signoutButton.removeAttribute("disabled");

    //Run the callback functions
    loginCallback();
  }
  else {
    authorizeButton.style.display = "block";
    signoutButton.style.display = "none";

    //Run the callback functions
    logoutCallback();
  }
  console.info("Updated sign in status.");
};

const signIn = ()=>{
  gapi.auth2.getAuthInstance().signIn();
};

const signOut = ()=>{
  gapi.auth2.getAuthInstance().signOut();
};

//Get channel from API
const getChannel = channel=>{
  gapi.client.youtube.channels.list({
    part: "snippet,contentDetails,statistics",
    id: [channel.id],
  })
    .then(response => {if(response.result.pageInfo.totalResults === 0) {throw new Error();} console.log(response.result.items[0]);})
    .catch(err => {
    try {
      const error = JSON.parse(err.body).error;
      console.error(err);
      alert(`${error.code}: ${error.message}\r\n\r\nException: Error getting user ${channel.id}. The application failed.`);
    }
    catch {console.error(err); alert("The application failed.");}
  });
};

import {throwException} from './../utilities';

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

    //If credentials weren't found, prompt the user for the credentials
    const clientId = window.prompt("Failed to get authorization credentials.\r\nPlease enter the client ID", "client_id");
    if (clientId) {
      const creds = JSON.parse(localStorage.getItem("creds"));
      localStorage.setItem("creds", JSON.stringify({
        ...creds,
        clientId,
      }));
      return {clientId};
    }
    throw new Error("Failed to get authorization credentials.");
  }
  catch (err) {
    throw err;
  }
};

//Load the Google Client, OAuth2.0 libraries
export const initAuthorization = (loginCallback, logoutCallback)=>{
  try {
    //Attempt to get the credentials
    const creds = fetchAuthCredentials();

    //Load the Google APIs
    loadGoogleApis(creds, loginCallback, logoutCallback)
  }
  catch (err) {
    throwException(err);
  }
};

const loadGoogleApis = (creds, loginCallback, logoutCallback)=>{
  console.info("Loading Google Client, OAuth2.0 APIs...");
  window.gapi.load("client:auth2", ()=>{initializeGoogleApis(creds, loginCallback, logoutCallback)});
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
    throwException(err);
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

export const signIn = ()=>{
  window.gapi.auth2.getAuthInstance().signIn();
};

export const signOut = ()=>{
  window.gapi.auth2.getAuthInstance().signOut();
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

const scopes = [
  "https://www.googleapis.com/auth/drive",
  "https://www.googleapis.com/auth/drive.file",
  "https://www.googleapis.com/auth/spreadsheets",
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
    const promptedCreds = window.prompt("Failed to get authorization credentials.\r\nPlease enter the api key, followed by the client ID, separated by a comma.", "api_key,client_id");
    if (promptedCreds && promptedCreds.indexOf(",") !== -1) {
      const [apiKey, clientId] = promptedCreds.split(",");
      return {apiKey, clientId};
    }
    throw new Error("Failed to get authorization credentials.");
  }
  catch (err) {
    const errorMsg = `${err}\r\nThe application failed.`;
    console.error(errorMsg);
    window.alert(errorMsg);
    throw new Error(errorMsg);
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
    const errorMsg = `The application failed.\r\n${err}`;
    console.error(errorMsg);
    window.alert(errorMsg);
    throw new Error(errorMsg);
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
  const {apiKey, clientId} = creds;

  //Attempt to initialize the Google API
  window.gapi.client.init({
    apiKey: apiKey,
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
    const errorMsg = `Failed to initialize Google Client API. The application failed.\r\n${err}`;
    console.error(errorMsg);
    window.alert(errorMsg);
    console.log(err)
    throw new Error(errorMsg);
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

//Get channel from API
const getChannel = channel=>{
  window.gapi.client.youtube.channels.list({
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

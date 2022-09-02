//Import modules
const GoogleAPIAuth = require("../googleApi/authorization");
const {getSpreadsheetId, convertSheetsArraysToJSON, convertJSONToSheetsArray, getDynamicPropertyByArray, convertArrayToA1Notation} = require('./utilities.js');


//Create helper functions
const callGoogleApiFunction = (googleApi, googleApiOptions, resourceType, method, optionsParam, pageToken)=>{
  //Declare variables
  let leftoverIds = null;
  const listIdChunkLength = 50;
  let params = [];
  let options = optionsParam;

  //Build the request options
  if (googleApi === "youtube") {
    options = {
      ...optionsParam,
      part: [
        "snippet",
        "contentDetails",
        "status",
      ],
    };
  }

  //Check that, if provided SOMETHING as an id,
  // it wasn't falsy
  if (
    options.id !== undefined &&  (
      options.id === null ||
      options.id.length === 0
    )
  ) return null;

  //If this was a "list" call, add extra options
  if (method === "list") {
    //Set the maximum amount of results per call
    options.maxResults = 50;

    //Only set the pageToken option if we're provided one
    if (pageToken) options.pageToken = pageToken;

    //Check that no more than 50 ids are searched per call;
    // Otherwise, query the first 50, and save the rest for
    // a follow-up call
    if (options.id && options.id instanceof Array && options.id.length > 50) {
      leftoverIds = options.id.splice(listIdChunkLength, options.id.length);
    }
  }

  //If more parameters were found in options, move them over
  if (options.params) {
    params = (options.params instanceof Array ? options.params : [options.params]);
    delete options.params;
  }

  //Return a Promise to the Google API
  return new Promise(async (resolve,reject)=>{
    try {
      //Get the resource object
      /* DEBUG */ console.log(`>[${new Date().toJSON()}] [INFO] Querying Google ${googleApi}.${resourceType}.${method} resource...`);
      const resource = getDynamicPropertyByArray(GoogleAPIAuth.google[googleApi](googleApiOptions), resourceType);
      /* DEBUG */ console.log(`>[${new Date().toJSON()}] [INFO] Queried Google ${googleApi}.${resourceType}.${method} resource.`);

      //Make the resource method call
      const response = await resource[method](options, ...params);

      //Check for errors
      if (response.error) {
        /* DEBUG */ console.error(`>[${new Date().toJSON()}] [ERROR] Resource: google.${googleApi}.${resourceType}.${method} |`, response.error);
        throw response.error;
      }
      /* DEBUG */ console.log(`>[${new Date().toJSON()}] [INFO] Resource: google.${googleApi}.${resourceType}.${method} |`, response);

      //If a "list" query was performed
      if (method === "list") {
        //If there are more results, recurse using the nextPageToken
        if (response.data.nextPageToken) return resolve([...response.data.items, ...await callGoogleApiFunction(googleApi, resourceType, method, options, response.data.nextPageToken)]);

        //If more than 50 ids were provided,
        // move to the next set of ids
        if (leftoverIds) return resolve([...response.data.items, ...await callGoogleApiFunction(googleApi, resourceType, method, {...options, id: leftoverIds})]);

        //If a single id was provided instead of an arary,
        // respond with the single resource using the first item of
        // response.data.items, instead of the array of items
        if ((options.id && !(options.id instanceof Array)) || (resourceType === "channels" && options.mine === true)) return resolve(response.data.items[0]);

        //Otherrwise, return the entire array of items
        return resolve([...response.data.items]);
      }

      if (method === "get") {
        if (resourceType === "spreadsheets.values") {
          //Return the values

          return resolve(convertSheetsArraysToJSON(response.data.values));
        }//Return the values

        return resolve(response.data);
      }

      //If an "update" or "insert" query was performed
      if (method === "update" || method === "insert") return resolve(response.data);

      //If a "delete" or some other query was performed
      return resolve(response);
    }
    catch (err) {
      /* DEBUG */ console.error(`>[${new Date().toJSON()}] [ERROR] Resource: google.${googleApi}.${resourceType}.${method} |`, err);
      return reject(err);
    }
  });
};


//Create functions
const getUserInfo = async ()=>{
  try {
    return callGoogleApiFunction("oauth2", {version: 'v2',}, "userinfo", "get", {});
  }
  catch (err) {
    /* DEBUG */ console.error(`>[${new Date().toJSON()}] [ERROR] Failed to call google.oauth2.userinfo.get: ${err}`);
    throw err;
  }
};

const getSheetsSpreadsheet = async ()=>{
  try {
    const spreadsheetId = getSpreadsheetId();
    return callGoogleApiFunction("sheets", {version: 'v4',}, "spreadsheets", "get", {spreadsheetId,});
  }
  catch (err) {
    /* DEBUG */ console.error(`>[${new Date().toJSON()}] [ERROR] Failed to call google.sheets.spreadsheets.get: ${err}`);
    throw err;
  }
};

const getSheetsSpreadsheetValues = async (sheetName, range)=>{
  try {
    const spreadsheetId = getSpreadsheetId();

    const {rowCount, columnCount} = (await getSheetsSpreadsheet()).sheets.find(s=>s.properties.title === sheetName).properties.gridProperties;
    if (!range) range = convertArrayToA1Notation([rowCount, columnCount]);
    if (typeof range === "string") range = [range]; //convert to an array of ranges if only one specified
    range = range.map(r=>`'${sheetName}'!${range}`); //Add the sheet name to the range

    return callGoogleApiFunction("sheets", {version: 'v4',}, "spreadsheets.values", "get", {spreadsheetId, range});
  }
  catch (err) {
    /* DEBUG */ console.error(`>[${new Date().toJSON()}] [ERROR] Failed to call google.sheets.spreadsheets.values.get: ${err}`);
    throw err;
  }
};

const updateSheetsSpreadsheetValues = async (sheetName, valuesJSON, range)=>{
  try {
    const spreadsheetId = getSpreadsheetId();
    const values = convertJSONToSheetsArray(valuesJSON);
    const neededRowCount = values.length;
    const neededColumnCount = values.reduce((maxCol,row)=>maxCol = Math.max(maxCol,row.length), 0);
    if (!range) range = convertArrayToA1Notation([neededRowCount, neededColumnCount]);
    if (typeof range === "string") range = [range]; //convert to an array of ranges if only one specified
    range = range.map(r=>`'${sheetName}'!${range}`); //Add the sheet name to the range

    return callGoogleApiFunction("sheets", {version: 'v4',}, "spreadsheets.values", "update", {
        spreadsheetId,
        range,
        valueInputOption: "USER_ENTERED",
        includeValuesInResponse: true,
        responseValueRenderOption: "FORMATTED_VALUE",
        resource: {
          values: values,
        }
      });
  }
  catch (err) {
    /* DEBUG */ console.error(`>[${new Date().toJSON()}] [ERROR] Failed to call google.sheets.spreadsheets.values.update: ${err}`);
    throw err;
  }
};


module.exports = {
  getUserInfo,
  getSheetsSpreadsheet,
  getSheetsSpreadsheetValues,
  updateSheetsSpreadsheetValues,
};

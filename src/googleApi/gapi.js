const convertSheetsArraysToJSON = (data, delimiter=",")=>{
  //Get the object keys
  const keys = data.splice(0,1)[0];

  //Return the data
  return data.map(line=>
    line.reduce((obj, value, i)=>
      ({
        ...obj,
        [keys[i]]: value,
      })
  , {})
  );
};

const getDynamicPropertyByArray = (startingObject, dotSeparatedProperties)=>{
  if (!(typeof dotSeparatedProperties === "string")) return null;
  if(!dotSeparatedProperties) return startingObject;
  if (!dotSeparatedProperties.includes(".")) return startingObject[dotSeparatedProperties];

  let object = startingObject;
  for(let property of dotSeparatedProperties.split(".")) {
    if (!property) continue;
    object = object[property];
  }
  return object;
};

const callGoogleApiFunction = (googleApi, resourceType, method, optionsParam, pageToken)=>{
  //Declare variables
  let leftoverIds = null;
  const listIdChunkLength = 50;

  //Build the request options
  const options = {
    ...{
      "part": [
        "snippet",
        "contentDetails",
        "status",
      ],
    },
    ...optionsParam
  };

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

  //Return a Promise to the Google API
  return new Promise(async (resolve,reject)=>{
    try {
      const response = await getDynamicPropertyByArray(window.gapi.client[googleApi], resourceType)[method](options);
      console.log(response);

      //If a "list" query was performed
      if (method === "list") {
        //If there are more results, recurse using the nextPageToken
        if (response.result.nextPageToken) return resolve([...response.result.items, ...await callGoogleApiFunction(googleApi, resourceType, method, options, response.result.nextPageToken)]);

        //If more than 50 ids were provided,
        // move to the next set of ids
        if (leftoverIds) return resolve([...response.result.items, ...await callGoogleApiFunction(googleApi, resourceType, method, {...options, id: leftoverIds})]);

        //If a single id was provided instead of an arary,
        // respond with the single resource using the first item of
        // response.result.items, instead of the array of items
        if ((options.id && !(options.id instanceof Array)) || (resourceType === "channels" && options.mine === true)) return resolve(response.result.items[0]);

        //Otherrwise, return the entire array of items
        return resolve([...response.result.items]);
      }

      if (method === "get") {
        //Return the values
        return resolve(convertSheetsArraysToJSON(response.result.values));
      }

      //If an "update" or "insert" query was performed
      if (method === "update" || method === "insert") return resolve(response.result);

      //If a "delete" or some other query was performed
      return resolve(response);
    }
    catch (err) {
      console.error(err);
      return reject(err);
    }
  });
};

//Declare our specific functions
const getSheetsSpreadsheet = spreadsheetId=>{
  return callGoogleApiFunction("sheets", "spreadsheets", "get", {spreadsheetId});
};

const getSheetsSpreadsheetValues = (spreadsheetId, sheetName, range)=>{
  return callGoogleApiFunction("sheets", "spreadsheets.values", "get", {spreadsheetId, range: (!range ? null : (typeof range === "string" ? [range] : range).map(r=>`'${sheetName}'!${range}`))});
};

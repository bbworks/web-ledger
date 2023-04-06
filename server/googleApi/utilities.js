const {parseNumber} = require('./../utilities/utilities');

//Private Functions
const getHeadersFromJSON = JSON=>{
  if (!JSON instanceof Array) JSON = [JSON];
  return JSON.reduce((headers, transaction)=>
    [
      ...headers,
      ...Object.keys(transaction).filter(key=>!headers.includes(key))
    ]
  , []);
};

//Public functions
const getSpreadsheetData = ()=>{
  //return JSON.parse(localStorage.getItem("spreadsheet-data"));
  return {
    spreadsheetId: process.env.SPREADSHEET_ID,
  };
};

const setSpreadsheetData = spreadsheetData=>{
  //return localStorage.setItem("spreadsheet-data", JSON.stringify(spreadsheetData));
};

const getSpreadsheetId = ()=>{
  const spreadsheetData = getSpreadsheetData();
  return (spreadsheetData ? spreadsheetData.spreadsheetId : null);
};

const setSpreadsheetId = spreadsheetId=>{
  const spreadsheetData = getSpreadsheetData() || {};
  const newSpreadsheetData = {
    ...spreadsheetData,
    spreadsheetId,
  };
  return setSpreadsheetData(newSpreadsheetData);
};

const getCredentials = ()=>{
  //return JSON.parse(localStorage.getItem("creds"));
  return {
    clientId: process.env.CLIENT_ID,
  };
};

const setCredentials = credentials=>{
  //return localStorage.setItem("creds", JSON.stringify(credentials));
};

const getClientId = ()=>{
  const creds = getCredentials();
  return (creds ? creds.clientId : null);
};

const setClientId = clientId=>{
  const creds = getCredentials() || {};
  const newCreds = {
    ...creds,
    clientId,
  };
  return setCredentials(newCreds);
};

const convertSheetsArraysToJSON = (data, delimiter=",")=>{
  if (!data) return null;

  //Get the object keys
  const keys = data.splice(0,1)[0];

  //Return the data
  return data.map(line=>
    line.reduce((obj, value, i)=>
      ({
        ...obj,
        [keys[i]]: (
          value === "" ?
          null :
          (value === "TRUE" ? true : (value === "FALSE" ? false : value))
        ),
      })
  , {})
  );
};

const convertJSONToSheetsArray = (JSON, delimiter=",")=>{
  if (!JSON) return null;

  const headers = getHeadersFromJSON(JSON);

  return [
    headers,
    ...JSON.map(object=>
      headers.map(header=>(
        object[header] === null ?
        "" :
        (Array.isArray(object[header]) ? object[header].join(",") : object[header]))
      )
    )
  ];
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

const convertColumnNumberToColumnLetter = columnNumber=>{
  const NUM_OF_LETTERS = 26;
  const columnLettersArray = [];

  //Decrement the column number by 1 (1-based, not 0-based)
  columnNumber--;

  for(;columnNumber >= 0;columnNumber=(columnNumber/NUM_OF_LETTERS)-1) {
    const index = Math.floor(columnNumber % NUM_OF_LETTERS);
    const letter = "ABCDEFGHIJKLMNOPQRSTUVWXYZ"[index];
    columnLettersArray.push(letter);
  }

  //Return back the "reversed" column letters
  return columnLettersArray.reverse().join("");
};

const convertColumnLetterToColumnNumber = columnLetters=>{
  const NUM_OF_LETTERS = 26;

  const columnNumber = [...columnLetters].reduce((number,columnLetter,i)=>{
    const index = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".indexOf(columnLetter);

    //Increment the column number by 1 (1-based, not 0-based)
    return number += (index+1) * (NUM_OF_LETTERS**i);
  }, 0);

  //Return back the "reversed" column letters
  return columnNumber;
};

const convertArrayToA1Notation = (rowsColumnsArray, startingCell="A1")=>{
  const startingColumnLetter = startingCell.match(/(^[A-Z]+)/)[1];
  const startingRow = Number(startingCell.match(/(\d)/)[1]);
  const startingColumnIndex = convertColumnLetterToColumnNumber(startingColumnLetter);

  const [rows, columns] = rowsColumnsArray;
  const columnLetter = convertColumnNumberToColumnLetter(startingColumnIndex+columns-1);
  const rowNumber = startingRow+rows-1;
  return `${startingCell}:${columnLetter}${rowNumber}`;
};

const parseGoogleSheetsNumber = value=>{
  return parseNumber(value);
};

const parseGoogleSheetsDate = JSON=>{
  const potentialDate = new Date(JSON);
  return (JSON && !isNaN(potentialDate.getTime()) ? potentialDate : null);
};

module.exports = {
  getSpreadsheetData,
  setSpreadsheetData,
  getSpreadsheetId,
  setSpreadsheetId,
  getCredentials,
  setCredentials,
  getClientId,
  setClientId,
  convertSheetsArraysToJSON,
  convertJSONToSheetsArray,
  getDynamicPropertyByArray,
  convertColumnNumberToColumnLetter,
  convertColumnLetterToColumnNumber,
  convertArrayToA1Notation,
  parseGoogleSheetsNumber,
  parseGoogleSheetsDate,
};
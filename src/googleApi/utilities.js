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
export const convertSheetsArraysToJSON = (data, delimiter=",")=>{
  if (!data) return null;

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

export const convertJSONToSheetsArray = (JSON, delimiter=",")=>{
  if (!JSON) return null;

  const headers = getHeadersFromJSON(JSON);

  return [
    headers,
    ...JSON.map(object=>
      headers.map(header=>(Array.isArray(object[header]) ? object[header].join(",") : object[header]))
    )
  ];
};

export const getDynamicPropertyByArray = (startingObject, dotSeparatedProperties)=>{
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

export const convertColumnNumberToColumnLetter = columnNumber=>{
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

export const convertColumnLetterToColumnNumber = columnLetters=>{
  const NUM_OF_LETTERS = 26;

  const columnNumber = [...columnLetters].reduce((number,columnLetter,i)=>{
    const index = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".indexOf(columnLetter);

    //Increment the column number by 1 (1-based, not 0-based)
    return number += (index+1) * (NUM_OF_LETTERS**i);
  }, 0);

  //Return back the "reversed" column letters
  return columnNumber;
};

export const convertArrayToA1Notation = (rowsColumnsArray, startingCell="A1")=>{
  const startingColumnLetter = startingCell.match(/(^[A-Z]+)/)[1];
  const startingRow = Number(startingCell.match(/(\d)/)[1]);
  const startingColumnIndex = convertColumnLetterToColumnNumber(startingColumnLetter);

  const [rows, columns] = rowsColumnsArray;
  const columnLetter = convertColumnNumberToColumnLetter(startingColumnIndex+columns-1);
  const rowNumber = startingRow+rows-1;
  return `${startingCell}:${columnLetter}${rowNumber}`;
};

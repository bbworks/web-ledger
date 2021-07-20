export const isFalsy = function(value) {
  return value !== 0 && (!value || value == false);
};

export const nullCoalesce = function(value) {
  if(isFalsy(arguments)) throw new Error("Function cannot accept 0 parameters.");
  return [...arguments].reduce((accumulator, value)=>accumulator = (isFalsy(accumulator) && !isFalsy(value) ? value : accumulator), null);
};

export const convertNumberToCurrency = function(value) {
  return Number(value)
    .toFixed(2)
    .toString()
    .replace(/\d{4,}/, (p0)=>p0.split('').reverse().join('').replace(/(\d{3})(?=\d)/g, "$1,").split('').reverse().join('')) //add commas
    .replace(/(\d)/, "$$$1") //add $
};

export const convertCSVToJSON = function(csv, delimiter = ",") {
  //Initialize variables
  const csvData = csv.split(/(?:\r\n|\r|\n)/).map(line=>line.split(delimiter));

  //Get the headers
  const headers = csvData.splice(0,1)[0];

  //Get the data
  const obj = csvData.map(line=>{
    const lineObj = {};
    line.forEach((value, i)=>{
      lineObj[headers[i]] = value;
    })
    return lineObj;
  });

  return obj;
};

export const getSumByProp = (array, prop)=>{
  //Make sure the provided object is an array
  if (!Array.isArray(array)) {
    //If its not even a single object, return null
    if(!typeof array === "object") return null;

    //Otherwise, wrap the object in an array for processing
    array = [array]
  }

  return Number(array.reduce((sum, item)=>{
    //If this an object, use the property
    if (typeof item === "object") {
      if (!Number.isNaN(item[prop])) return sum+=item[prop];
    }

    //Otherwise, if a number, use the item directly
    if (!Number.isNaN(item)) return sum+=item;
  }, 0)) || null;
};

export const areObjectsEqual = (a,b)=>{
  //## typeof values
  //"undefined"
  //"boolean"
  //"number"
  //"bigint"
  //"string"
  //"symbol"
  //"function" (non-primitive)
  //"object"  (non-primitive) //includes null

  //
  if (a === null) {
    if (b === null) {
      return true;
    }
    return false;
  }

  //First, if not the same type, exit
  const typeofA = typeof a;
  const typeofB = typeof b;
  if (typeofA !== typeofB) return false;

  //If these are objects, recurse into them
  if (typeofA === "object") {
    const aValues = Object.entries(a);
    const bValues = Object.entries(b);

    //Short-circuit if the number of properties aren't the same
    if(aValues.length !== bValues.length) return false;

    for(let i = 0; i < aValues.length; i++) {
      const [aKey, aValue] = aValues[i];
      const [bKey, bValue] = bValues[i];
      if(aKey !== bKey) return false;
      if (!areObjectsEqual(aValue, bValue)) return false;
    }

    //If the objects properties/arrays values are all the same, return true
    return true;
  }

  //Otherwise, compare the values
  return a === b;
};
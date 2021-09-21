export const isFalsy = function(value) {
  return value !== 0 && (!value || value == false);
};

export const nullCoalesce = function(value) {
  if(isFalsy(arguments)) throw new Error("Function cannot accept 0 parameters.");
  return [...arguments].reduce((accumulator, value)=>accumulator = (isFalsy(accumulator) && !isFalsy(value) ? value : accumulator), null);
};

export const convertNumberToCurrency = function(value) {
  if (isNaN(value)) return null;
  return Number(value)
    .toFixed(2)
    .toString()
    .replace(/\d{4,}/, (p0)=>p0.split('').reverse().join('').replace(/(\d{3})(?=\d)/g, "$1,").split('').reverse().join('')) //add commas
    .replace(/(\d)/, "$$$1") //add $
};

export const convertCSVToJSON = function(csv, delimiter = ",") {
  //Initialize variables
  const csvData = csv
    //Break apart by new line
    .split(/(?:\r\n|\r|\n)/)
    //Begin breaking apart each line by the delimiter
    .map(line=>(!line ? null : line.split(delimiter)))
    //Remove the empty lines
    .filter(line=>line);

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

export const convertDateStringToDate = (dateString, dateStringFormat)=>{
  //Declare variables
  const yearSymbol = "y";
  const monthSymbol = "M";
  const daySymbol = "d";

  const yearFormatRegEx = new RegExp(`(${yearSymbol}{1,4})`, "g");
  const monthFormatRegEx = new RegExp(`(${monthSymbol}{1,4})`, "g");
  const dayFormatRegEx = new RegExp(`(${daySymbol}{1,2})`, "g");

  const getDatePartByFormat = (dateString, dateStringFormat, datePartFormatRegex, getDatePartCallback)=>{
    //Match against the provided format
    const isMatch = [...dateStringFormat.matchAll(datePartFormatRegex)];

    //If none were found, or more than one match is found, throw
    if (!isMatch || isMatch.length > 1) throw new Error(`Error: Format "${dateStringFormat}" matched RegExp ${datePartFormatRegex.toString()} ${(isMatch ? isMatch.length : 0)} time${(isMatch ? "s" : "")}.`);

    const matchStartingIndex = isMatch[0].index;
    const matchedFormat = isMatch[0][1];
    const matchEndingIndex = matchedFormat.length + matchStartingIndex;
    const matchedString = dateString.substring(matchStartingIndex, matchEndingIndex);

    //Return back the month index based on the format
    return getDatePartCallback(matchedString, matchedFormat);
  };

  const getYearByFormat = (yearString, yearFormat)=>{
    if (Number.isNaN(yearString)) return null;

    if (yearFormat === "yy") return Number((new Date()).getUTCFullYear().toString().substring(0,2)+yearString);
    if (yearFormat === "yyyy") return Number(yearString);

    return null;
  };

  const getMonthIndexByFormat = (monthString, monthFormat)=>{
    if (monthFormat === "M") {
      if (monthString === "1") return 0;
      if (monthString === "2") return 1;
      if (monthString === "3") return 2;
      if (monthString === "4") return 3;
      if (monthString === "5") return 4;
      if (monthString === "6") return 5;
      if (monthString === "7") return 6;
      if (monthString === "8") return 7;
      if (monthString === "9") return 8;
      if (monthString === "10") return 9;
      if (monthString === "11") return 10;
      if (monthString === "12") return 11;
    }
    if (monthFormat === "MM") {
      if (monthString === "01") return 0;
      if (monthString === "02") return 1;
      if (monthString === "03") return 2;
      if (monthString === "04") return 3;
      if (monthString === "05") return 4;
      if (monthString === "06") return 5;
      if (monthString === "07") return 6;
      if (monthString === "08") return 7;
      if (monthString === "09") return 8;
      if (monthString === "10") return 9;
      if (monthString === "11") return 10;
      if (monthString === "12") return 11;
    }
    if (monthFormat === "MMM") {
      if (monthString === "Jan") return 0;
      if (monthString === "Feb") return 1;
      if (monthString === "Mar") return 2;
      if (monthString === "Apr") return 3;
      if (monthString === "May") return 4;
      if (monthString === "Jun") return 5;
      if (monthString === "Jul") return 6;
      if (monthString === "Aug") return 7;
      if (monthString === "Sep") return 8;
      if (monthString === "Oct") return 9;
      if (monthString === "Nov") return 10;
      if (monthString === "Dec") return 11;
    }
    if (monthFormat === "MMMM") {
      if (monthString === "January") return 0;
      if (monthString === "February") return 1;
      if (monthString === "March") return 2;
      if (monthString === "April") return 3;
      if (monthString === "May") return 4;
      if (monthString === "June") return 5;
      if (monthString === "July") return 6;
      if (monthString === "August") return 7;
      if (monthString === "September") return 8;
      if (monthString === "October") return 9;
      if (monthString === "November") return 10;
      if (monthString === "December") return 11;
    }

    return null;
  };

  const getDayByFormat = (monthString, monthFormat)=>{
    if (Number.isNaN(monthString) || Number(monthString) < 1 || Number(monthString) > 31) return null;

    return Number(monthString);
  };

  return new Date(
    getDatePartByFormat(dateString, dateStringFormat, yearFormatRegEx, getYearByFormat),
    getDatePartByFormat(dateString, dateStringFormat, monthFormatRegEx, getMonthIndexByFormat),
    getDatePartByFormat(dateString, dateStringFormat, dayFormatRegEx, getDayByFormat)
  );
};

export const isDescendantOf = (element, potentialParent) => {
  if (
    element.parentElement &&
    potentialParent &&
    element.parentElement !== potentialParent
  ) return isDescendantOf(element.parentElement, potentialParent);

  return element.parentElement != null &&
    potentialParent != null &&
    element.parentElement === potentialParent;
};

export const matchValueAgainstValue = (value, matchedValue)=>{
  //Perform validations
  if (!value) value = "";
  if (value instanceof Date) value = value.toJSON(); //perform Date before Number (as Date() is not NaN)
  if (!isNaN(value)) value = value.toString();

  if (!matchedValue) matchedValue = "";
  if (matchedValue instanceof Date) matchedValue = matchedValue.toJSON(); //perform Date before Number (as Date() is not NaN)
  if (!isNaN(matchedValue)) matchedValue = matchedValue.toString();

  //Escape the matched value to prepare for RegExp
  const escapedMatchedValue = matchedValue.replace(/([-\/\\^$*+?.()|[\]{}])/g, '\\$1');

  return value.match(new RegExp(`(${escapedMatchedValue})`, "i"));
};

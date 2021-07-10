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

export const getBudgetAmountSpentFromTransactions = (budgetName, transactions)=>{
  return transactions.reduce((amountSpent,i)=>amountSpent+=(i.Category === budgetName ? i.Amount : 0), 0);
};

export const getMonthFromNumber = number=>{
  switch (number) {
    case 0:
      return "January";
      break;
    case 1:
      return "February";
      break;
    case 2:
      return "March";
      break;
    case 3:
      return "April";
      break;
    case 4:
      return "May";
      break;
    case 5:
      return "June";
      break;
    case 6:
      return "July";
      break;
    case 7:
      return "August";
      break;
    case 8:
      return "September";
      break;
    case 9:
      return "October";
      break;
    case 10:
      return "November";
      break;
    case 11:
      return "December";
      break;
  }
  return null;
};

export const getCurrentYear = (date)=>{
  return date.getFullYear();
};

export const getBillingCycleFromDate = date=>{
  return `${getMonthFromNumber(date.getMonth())} ${getCurrentYear(date)}`;
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

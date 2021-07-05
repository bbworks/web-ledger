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
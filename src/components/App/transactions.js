//Imports
import {isFalsy, nullCoalesce, convertNumberToCurrency, convertCSVToJSON} from './../../utilities.js';

//Initialize variables
const transactionLocalStorageItemKey = "transaction-data";

//Declare private functions
const typeCheckTransactions = function (transactions) {
  return transactions.map(transaction=>(
    {
      ...transaction,
      data: {
        ...transaction.data,
        PostedDate: transaction.data.PostedDate && new Date(transaction.data.PostedDate),
        TransactionDate: transaction.data.TransactionDate && new Date(transaction.data.TransactionDate),
        Amount: Number(transaction.data.Amount),
      },
      display: {
        ...transaction.display,
        // PostedDate: transaction.display.PostedDate && new Date(transaction.display.PostedDate),
        // TransactionDate: transaction.display.TransactionDate && new Date(transaction.display.TransactionDate),
        //Amount: Number(transaction.display.Amount),
      },
    }
  ));
};

const filterTransactions = function (transactions) {
  return transactions.map(transaction=>(
    {
      ...transaction,
      display: (transaction.display.Description && transaction.display.Description.toUpperCase() === "PAYMENT - THANK YOU ATLANTA GA" ? null : transaction.display),
    }
  ));
};

const validateDescription = function(transaction) {
  const {Description: description, Tags: tags, Category: category, Notes: notes} = transaction.data;
  let validation = {Category: category, Description: `*${description}`, Notes: notes, Tags: tags || [],};

  //Skip the transaction if there is no description
  if (isFalsy(description)) return {
    ...transaction,
    display: {
      ...transaction.display,
      ...validation
    },
  };

  //Bills
      if (description.match(/Spectrum 855-707-7328 SC/i))  validation = {Category: "Spectrum Internet", Description: "Charge to CCD *3991", Notes: null};
  else if (description.match(/Simplisafe 888-957-4675 Ma/i))  validation = {Category: "SimpliSafe (for mom)", Description: "Charge to CCD *3991", Notes: null};
  else if (description.match(/SDC\*Laurens Electric C Laurens SC/i))  validation = {Category: "Laurens Electric ProTec Security", Description: "Charge to CCD *3991", Notes: null};
  else if (description.match(/SJWD Water District 8649492805 SC/i))  validation = {Category: "SJWD Water District", Description: "Charge to CCD *3991", Notes: null};
  else if (description.match(/State Farm Insurance 8009566310 Il/i))  validation = {Category: "State Farm auto insurance", Description: "Charge to CCD *3991", Notes: null};
  else if (description.match(/Spotelse if y USA(?: New York NY)?/i))  validation = {Category: "Spotelse if y Premium subscription", Description: "Charge to CCD *3991", Notes: null};
  else if (description.match(/Netflix.Com Netflix.Com Ca/i))  validation = {Category: "Netflix Premium subscription", Description: "Charge to CCD *3991", Notes: null};
  else if (description.match(/Ddv \*Discoveryplus 0123456789 TN/i))  validation = {Category: "Discovery Plus subscription", Description: "Charge to CCD *3991", Notes: null};
  else if (description.match(/AT&T \*Payment 800-288-2020 TX/i))  validation = {Category: "AT&T Internet", Description: "Charge to CCD *3991", Notes: null};

  //Recurring expenses

  //Gas
  else if (description.match(/QT \d+ (?:INSIDE|OUTSIDE|\w+ \w{2})/i)) validation = {Category: "Gas", Description: "QuikTrip", Notes: null};
  else if (description.match(/CIRCLE K # \d+ \w+ \w{2}/i)) validation = {Category: "Gas", Description: "Circle K", Notes: null};
  else if (description.match(/7-ELEVEN \d+ \w+ \w{2}/i)) validation = {Category: "Gas", Description: "7-Eleven", Notes: null};

  //Groceies & Necessities
  else if (description.match(/Walmart Grocery [\d-]+ Ar/i)) validation = {Category: "Groceries/Necessities", Description: "Walmart Supercenter", Notes: "grocery pickup"};
  else if (description.match(/(?:Wal-Mart|WM Supercenter) #\d+ \w+ \w{2}/i)) validation = {Category: "Groceries/Necessities", Description: "Walmart Supercenter", Notes: "grocery pickup"};
  else if (description.match(/Target #\d+ \w+ \w{2}/i)) validation = {Category: "Groceries/Necessities", Description: "Target", Notes: null};
  else if (description.match(/Ingles Markets #\d+ \w+ \w{2}/i)) validation = {Category: "Groceries/Necessities", Description: "Ingles", Notes: null};
  else if (description.match(/Publix #\d+ \w+ \w{2}/i)) validation = {Category: "Groceries/Necessities", Description: "Publix", Notes: "grocery pickup"};
  else if (description.match(/(?:Sams ?Club #8142 Spartanburg SC|Sams Club #8142 864-574-3480 SC)/i)) validation = {Category: "Groceries/Necessities", Description: "Sam's Club", Notes: null};

  else if (description.match(/Walgreens #\d+/i)) validation = {Category: "Groceries/Necessities", Description: "Walgreens", Notes: null};

  //Famil Outings
  else if (description.match(/McDonald's \w+ \w+ \w{2}/i))  validation = {Category: "Family Outings", Description: "McDonald's", Notes: null};
  else if (description.match(/Burger King #\d+(?: \w+ \w+ \w{2})?/i))  validation = {Category: "Family Outings", Description: "Burger King", Notes: null};
  else if (description.match(/PDQ \d+ OLO \w+ \w{2}/i))  validation = {Category: "Family Outings", Description: "PDQ", Notes: null};
  else if (description.match(/Chick-Fil-A #\d+ \w+ \w{2}/i))  validation = {Category: "Family Outings", Description: "Chick-fil-A", Notes: null};
  else if (description.match(/Bojangles \d+ \w+/i))  validation = {Category: "Family Outings", Description: "Bojangles", Notes: null};
  else if (description.match(/Cook Out [\w ]+(?: \w+ \w{2})?/i))  validation = {Category: "Family Outings", Description: "Cook Out", Notes: null};
  else if (description.match(/Wendys #\d+ \w+ \w{2}/i))  validation = {Category: "Family Outings", Description: "Wendy's", Notes: null};
  else if (description.match(/Sweet Basil Thai Cusin Greenville SC/i))  validation = {Category: "Family Outings", Description: "Sweet Basil Thai Cusine", Notes: null};
  else if (description.match(/Panda Hibachi Duncan SC/i))  validation = {Category: "Family Outings", Description: "Panda Hibachi", Notes: null};
  else if (description.match(/El Molcajete Duncan Sc/i))  validation = {Category: "Family Outings", Description: "El Molcajete", Notes: null};
  else if (description.match(/(?:Chipotle \d+ \w \w{2}|Chipotle Online 1800\d{6} CA)/i))  validation = {Category: "Family Outings", Description: "Chipotle", Notes: null};
  else if (description.match(/La Fogata Mexican Rest Simpsonville Sc/i))  validation = {Category: "Family Outings", Description: "La Fogata", Notes: null};
  else if (description.match(/Pizza Hut \d+ \d+ \w{2}/i))  validation = {Category: "Family Outings", Description: "Pizza Hut", Notes: null};
  else if (description.match(/Tutti Frutti Spartanburg SC/i))  validation = {Category: "Family Outings", Description: "Tutti Frutti", Notes: null};

  //Church
  else if (description.match(/Brookwood Church Donat Simpsonville Sc/i))  validation = {Category: "Church", Description: "Brookwood Church", Notes: "online giving"};

  //Other
  else if (description.match(/Dollartree \w+ \w{2}/i))  validation = {Category: null, Description: "Dollar Tree", Notes: null};
  else if (description.match(/[\w\* ]+ amzn.com\/billwa/i))  validation = {Category: null, Description: "Amazon", Notes: null};

  return {
    ...transaction,
    display: {
      ...transaction.display,
      ...validation
    },
  };
};

const formatTransactions = function(transactions) {
  return transactions.map(transaction=>(
    {
      ...transaction,
      display: {
        ...transaction.display,
        PostedDate: (transaction.data.PostedDate ? new Date(transaction.data.PostedDate).toLocaleDateString().toString() : ""),
        TransactionDate: (transaction.data.TransactionDate ? new Date(transaction.data.TransactionDate).toLocaleDateString().toString() : ""),
        Description: transaction.display.Description && transaction.display.Description.replace(/([\w\'&]+)/g, p1=>p1[0].toUpperCase() + p1.substring(1).toLowerCase()),
        Amount: convertNumberToCurrency(transaction.data.Amount),
      }
    }
  ));
};


//Declare public functions
export const importTransactions = function(transactionData, dataType) {
  const convertMonthDayStringToDate = function(dateString) {
    //Initialize functions
    const returnMonthIndex = function(month) {
      if (month.match(/^Jan$/i)) return 0;
      if (month.match(/^Feb$/i)) return 1;
      if (month.match(/^Mar$/i)) return 2;
      if (month.match(/^Apr$/i)) return 3;
      if (month.match(/^May$/i)) return 4;
      if (month.match(/^Jun$/i)) return 5;
      if (month.match(/^Jul$/i)) return 6;
      if (month.match(/^Aug$/i)) return 7;
      if (month.match(/^Sep$/i)) return 8;
      if (month.match(/^Oct$/i)) return 9;
      if (month.match(/^Nov$/i)) return 10;
      if (month.match(/^Dec$/i)) return 11;
      return false;
    };

    //Declare variables
    const now = new Date();
    const [month, day] = dateString.split(" ");
    const monthIndex = returnMonthIndex(month);

    //Convert to actual date
    const date = new Date(now.getFullYear(), monthIndex, day)

    //Adjust date backwards one year if this ends up being a future date
    if (date > now) date.setFullYear(date.getFullYear()-1);

    return date
  };

  const convertDateStringToDate = function(dateString) {
    //Initialize functions
    return new Date(...dateString.replace(/(\d{1,2})\/(\d{1,2})\/(\d{4})/, (p0,p1,p2,p3)=>[p3, Number(p1)-1, p2]).split(/\s*,\s*/));
  };

  try {
    let transactions = {};

    //if this is scraped from online app
    if (dataType === "scraped") {
      //Spilt the string of transactions into an array
      const transactionsArray = transactionData.split("POSTED:")
        //Filter out empty data
        .filter(transaction=>!isFalsy(transaction))
        //Remove unwanted data from the transactions
        .map(transaction=>transaction.replace("\tPending Transactions Ends", ""));

      //Massage the data into intelligible objects
      transactions = transactionsArray.map(transaction=>{
        //Parse the transaction string into an object
        const isMatch = transaction.match(/(PENDING|(\w+)\s*(\d+))\s*TRANSACTION:(\w+)\s*(\d+)\s+(?:Card No:([\*\d]+)\s*)?Description:(.+)\s*(Charges|Payments):(-?)\$([\d,]+\.\d{2})\s*/);
        if (isFalsy(isMatch)) throw new Error(`Unable to read transaction.\r\n${transaction}`);
        const matches = isMatch.map(match=>(match ? match.trim() : match))

        const transactionObj = {
          PostedDate: (matches[1] === "PENDING" ? null : convertMonthDayStringToDate(`${matches[2]} ${matches[3]}`)),
          TransactionDate: convertMonthDayStringToDate(`${matches[4]} ${matches[5]}`),
          Card: matches[6],
          Description: matches[7],
          Type: matches[8],
          Amount: Number(`${matches[9]}${matches[10]}`.replace(",","")) * -1,
          Tags: transaction.Tags || [],
        };

        return {
          data: transactionObj,
          display: transactionObj,
        };
      })
      .reverse();
    }
    //Otherwise, this is CSV or JSON data
    else {
      //If CSV data, convert it to JSON
      if (dataType === "csv") transactionData = transactionData.map(csvData=>convertCSVToJSON(csvData)).flat();

      //For each CSV file, convert the contents to JSON
      transactions = transactionData.map(transaction=>{
        //Validate calculated values
        const type = nullCoalesce(transaction.Type, (transaction.Charges ? "Charges" : (transaction.Payments ? "Payments" : null)));
        const transactionDate = convertDateStringToDate(nullCoalesce(transaction.TransactionDate, transaction.Date));
        if (isFalsy(type) || isFalsy(transactionDate)) throw new Error(`Unable to read transaction.\r\n${transaction}`);

        const transactionObj = {
          PostedDate: (!isFalsy(transaction.PostedDate) ? convertDateStringToDate(transaction.PostedDate) : null),
          TransactionDate: transactionDate,
          Card: nullCoalesce(transaction.Card, `*${transaction["Card No."]}`),
          Description: transaction.Description,
          Type: type,
          Amount: Number(nullCoalesce(!isFalsy(transaction.Amount) && transaction.Amount.replace("$",''), `${(type === "Charges" ? "-" : "")}${transaction[type]}`)),
          Category: nullCoalesce(transaction.Category),
          Notes: nullCoalesce(transaction.Notes),
          Tags: transaction.Tags || [],
        };

        return {
          data: transactionObj,
          display: transactionObj,
        };
      });
    }

    //Return the transaction objects
    return transactions;
  }
  catch (err) {
    throw err;
  }
};

export const updateTransactions = function(transactions) {
  //Type check values (possible type mismatch from JSON parse)
  transactions = typeCheckTransactions(transactions);

  //Assign category & notes from description
  transactions = transactions.map(transaction=>validateDescription(transaction));

  //Filter out transaction display data for the transaction table
  //transactions = filterTransactions(transactions);

  //Format the transaction data for the transaction table
  transactions = formatTransactions(transactions);

  //Save the data to localStorage
  localStorage.setItem(transactionLocalStorageItemKey, JSON.stringify(transactions));

  return transactions;
};

export const fetchTransactionData = function() {
  //Attempt to fetch the transaction data from localStorage
  const transactions = JSON.parse(localStorage.getItem(transactionLocalStorageItemKey));
  if (isFalsy(transactions)) return [];

  //Return the transactions
  return transactions;
};

export const importFormOnSubmit = event=>{
  //Prevent form submission
  event.preventDefault();

  //Get the transaction data
  const transactionData = event.target.querySelector("#transaction-import-input").value;

  //Import the transaction data into an array of transaction objects
  const transactions = importTransactions(transactionData, "scraped");
};

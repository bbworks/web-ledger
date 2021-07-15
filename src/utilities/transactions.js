import {isFalsy, nullCoalesce, convertNumberToCurrency, convertCSVToJSON, getBudgetAmountSpentFromTransactions, getMonthFromNumber, getCurrentYear, getBillingCycleFromDate} from './utilities.js';

//Initialize variables
const transactionLocalStorageItemKey = "transaction-data";

//Declare private functions
// const filterTransactions = function (transactions) {
//   return transactions.map(transaction=>(
//     {
//       ...transaction,
//       display: (transaction.display.Description && transaction.display.Description.toUpperCase() === "PAYMENT - THANK YOU ATLANTA GA" ? null : transaction.display),
//     }
//   ));
// };

//Declare public functions
export const typeCheckTransactions = function (transactions) {
  return transactions.map(transaction=>(
    {
      ...transaction,
      PostedDate: transaction.PostedDate && new Date(transaction.PostedDate),
      TransactionDate: transaction.TransactionDate && new Date(transaction.TransactionDate),
      Type: (transaction.Type ? transaction.Type : null),
      Category: (transaction.Category ? transaction.Category : null),
      Description: (transaction.Description ? transaction.Description : null),
      Category: (transaction.Category ? transaction.Category : null),
      Amount: (isNaN(transaction.Amount) ? Number(transaction.Amount.replace(/(\$|,)/g, "")) : transaction.Amount),
      Tags: (!isFalsy(transaction.Tags) ? transaction.Tags : []),

    }
  ));
};

export const categorizeTransactionByDescription = function(transaction) {
  const {DescriptionDisplay, Description, Tags, Category, Notes} = transaction;

  //Skip the transaction if there is no Description
  if (isFalsy(Description)) return transaction;

  //Define a base for categorized transaction data
  let categorizedTransactionData = {
    Category,
    DescriptionDisplay: nullCoalesce(DescriptionDisplay, `*${Description}`),
    Notes,
  };

  //Bills
      if (Description.match(/Spectrum 855-707-7328 SC/i))  categorizedTransactionData = {Category: "Spectrum Internet", DescriptionDisplay: "Charge to CCD *3991", Notes: null};
  else if (Description.match(/Simplisafe 888-957-4675 Ma/i))  categorizedTransactionData = {Category: "SimpliSafe (for mom)", DescriptionDisplay: "Charge to CCD *3991", Notes: null};
  else if (Description.match(/SDC\*Laurens Electric C Laurens SC/i))  categorizedTransactionData = {Category: "Laurens Electric ProTec Security", DescriptionDisplay: "Charge to CCD *3991", Notes: null};
  else if (Description.match(/SJWD Water District 8649492805 SC/i))  categorizedTransactionData = {Category: "SJWD Water District", DescriptionDisplay: "Charge to CCD *3991", Notes: null};
  else if (Description.match(/State Farm Insurance 8009566310 Il/i))  categorizedTransactionData = {Category: "State Farm auto insurance", DescriptionDisplay: "Charge to CCD *3991", Notes: null};
  else if (Description.match(/Spotify USA(?: New York NY)?/i))  categorizedTransactionData = {Category: "Spotify Premium subscription", DescriptionDisplay: "Charge to CCD *3991", Notes: null};
  else if (Description.match(/Netflix.Com Netflix.Com Ca/i))  categorizedTransactionData = {Category: "Netflix Premium subscription", DescriptionDisplay: "Charge to CCD *3991", Notes: null};
  else if (Description.match(/Ddv \*Discoveryplus 0123456789 TN/i))  categorizedTransactionData = {Category: "Discovery Plus subscription", DescriptionDisplay: "Charge to CCD *3991", Notes: null};
  else if (Description.match(/(?:AT&T \*Payment|ATT\*BILL PAYMENT) 800-288-2020 TX/i))  categorizedTransactionData = {Category: "AT&T Internet", DescriptionDisplay: "Charge to CCD *3991", Notes: null};
  else if (Description.match(/KIRBY SANITATION\/C&J E 8648778887 SC/i))  categorizedTransactionData = {Category: "Kirby Sanitation", DescriptionDisplay: "Charge to CCD *3991", Notes: null};

  //Recurring expenses

  //Gas
  else if (Description.match(/QT \d+ (?:INSIDE|OUTSIDE|\w+ \w{2})/i)) categorizedTransactionData = {Category: "Gas", DescriptionDisplay: "QuikTrip", Notes: null};
  else if (Description.match(/CIRCLE K # \d+ \w+ \w{2}/i)) categorizedTransactionData = {Category: "Gas", DescriptionDisplay: "Circle K", Notes: null};
  else if (Description.match(/7-ELEVEN \d+ \w+ \w{2}/i)) categorizedTransactionData = {Category: "Gas", DescriptionDisplay: "7-Eleven", Notes: null};
  else if (Description.match(/SPINX #\d+ \w+ \w{2}/i)) categorizedTransactionData = {Category: "Gas", DescriptionDisplay: "Spinx", Notes: null};
  else if (Description.match(/LOVE S TRAVEL \d+ [\w ]+ \w{2}/i)) categorizedTransactionData = {Category: "Gas", DescriptionDisplay: "Love's", Notes: null};
  else if (Description.match(/SHELL OIL [\d\w]+ [\w ]+ \w{2}/i)) categorizedTransactionData = {Category: "Gas", DescriptionDisplay: "Shell", Notes: null};

  //Groceies & Necessities
  else if (Description.match(/Walmart Grocery [\d-]+ Ar/i)) categorizedTransactionData = {Category: "Groceries/Necessities", DescriptionDisplay: "Walmart Supercenter", Notes: "grocery pickup"};
  else if (Description.match(/(?:Wal-Mart|WM Supercenter) #\d+ \w+ \w{2}/i)) categorizedTransactionData = {Category: "Groceries/Necessities", DescriptionDisplay: "Walmart Supercenter", Notes: "grocery pickup"};
  else if (Description.match(/Target #\d+ \w+ \w{2}/i)) categorizedTransactionData = {Category: "Groceries/Necessities", DescriptionDisplay: "Target", Notes: null};
  else if (Description.match(/Ingles Markets #\d+ \w+ \w{2}/i)) categorizedTransactionData = {Category: "Groceries/Necessities", DescriptionDisplay: "Ingles", Notes: null};
  else if (Description.match(/Publix #\d+ \w+ \w{2}/i)) categorizedTransactionData = {Category: "Groceries/Necessities", DescriptionDisplay: "Publix", Notes: "grocery pickup"};
  else if (Description.match(/(?:Sams ?Club #8142 Spartanburg SC|Sams Club #8142 864-574-3480 SC)/i)) categorizedTransactionData = {Category: "Groceries/Necessities", DescriptionDisplay: "Sam's Club", Notes: null};

  else if (Description.match(/Walgreens #\d+/i)) categorizedTransactionData = {Category: "Groceries/Necessities", DescriptionDisplay: "Walgreens", Notes: null};

  //Family Outings
  else if (Description.match(/McDonald's \w+ \w+ \w{2}/i))  categorizedTransactionData = {Category: "Family Outings", DescriptionDisplay: "McDonald's", Notes: null};
  else if (Description.match(/Burger King #\d+(?: \w+ \w+ \w{2})?/i))  categorizedTransactionData = {Category: "Family Outings", DescriptionDisplay: "Burger King", Notes: null};
  else if (Description.match(/PDQ \d+ OLO \w+ \w{2}/i))  categorizedTransactionData = {Category: "Family Outings", DescriptionDisplay: "PDQ", Notes: null};
  else if (Description.match(/Chick-Fil-A #\d+ \w+ \w{2}/i))  categorizedTransactionData = {Category: "Family Outings", DescriptionDisplay: "Chick-fil-A", Notes: null};
  else if (Description.match(/Sonic Drive In #\d+ \w+ \w{2}/i))  categorizedTransactionData = {Category: "Family Outings", DescriptionDisplay: "Sonic Drive-In", Notes: null};
  else if (Description.match(/Bojangles \d+ \w+/i))  categorizedTransactionData = {Category: "Family Outings", DescriptionDisplay: "Bojangles", Notes: null};
  else if (Description.match(/Cook Out [\w ]+(?: \w+ \w{2})?/i))  categorizedTransactionData = {Category: "Family Outings", DescriptionDisplay: "Cook Out", Notes: null};
  else if (Description.match(/Wendys #\d+ \w+ \w{2}/i))  categorizedTransactionData = {Category: "Family Outings", DescriptionDisplay: "Wendy's", Notes: null};
  else if (Description.match(/WAFFLE HOUSE \d+ \w+ \w{2}/i))  categorizedTransactionData = {Category: "Family Outings", DescriptionDisplay: "Waffle House", Notes: null};
  else if (Description.match(/Sweet Basil Thai Cusin Greenville SC/i))  categorizedTransactionData = {Category: "Family Outings", DescriptionDisplay: "Sweet Basil Thai Cusine", Notes: null};
  else if (Description.match(/Paisanos Italian Resta/i))  categorizedTransactionData = {Category: "Family Outings", DescriptionDisplay: "Paisanos Italian Restaurant", Notes: null};
  else if (Description.match(/Panda Hibachi Duncan SC/i))  categorizedTransactionData = {Category: "Family Outings", DescriptionDisplay: "Panda Hibachi", Notes: null};
  else if (Description.match(/El Molcajete Duncan Sc/i))  categorizedTransactionData = {Category: "Family Outings", DescriptionDisplay: "El Molcajete", Notes: null};
  else if (Description.match(/(?:Chipotle \d+ \w \w{2}|Chipotle Online 1800\d{6} CA)/i))  categorizedTransactionData = {Category: "Family Outings", DescriptionDisplay: "Chipotle", Notes: null};
  else if (Description.match(/El Tejano Mexican Rest/i))  categorizedTransactionData = {Category: "Family Outings", DescriptionDisplay: "El Tejano", Notes: null};
  else if (Description.match(/La Fogata Mexican Rest Simpsonville Sc/i))  categorizedTransactionData = {Category: "Family Outings", DescriptionDisplay: "La Fogata", Notes: null};
  else if (Description.match(/Pizza Hut \d+ \d+ \w{2}/i))  categorizedTransactionData = {Category: "Family Outings", DescriptionDisplay: "Pizza Hut", Notes: null};
  else if (Description.match(/Tutti Frutti Spartanburg SC/i))  categorizedTransactionData = {Category: "Family Outings", DescriptionDisplay: "Tutti Frutti", Notes: null};
  else if (Description.match(/KRISPY KREME \d+ \w+ \w{2}/i))  categorizedTransactionData = {Category: "Family Outings", DescriptionDisplay: "Krispy Kreme", Notes: null};

  else if (Description.match(/Taco Casa #\d+ \w+ \w{2}/i))  categorizedTransactionData = {Category: "Family Outings", DescriptionDisplay: "Taco Casa", Notes: null};
  else if (Description.match(/Krystal [\d\w]+ \w+ \w{2}/i))  categorizedTransactionData = {Category: "Family Outings", DescriptionDisplay: "Krystal", Notes: null};
  else if (Description.match(/Checkers Drive In \w+ \w{2}/i))  categorizedTransactionData = {Category: "Family Outings", DescriptionDisplay: "Checkers", Notes: null};

  //Church
  else if (Description.match(/Brookwood Church Donat Simpsonville Sc/i))  categorizedTransactionData = {Category: "Church", DescriptionDisplay: "Brookwood Church", Notes: "online giving"};

  //Personal Spending
  else if (Description.match(/HARBOR FREIGHT TOOLS \d \w+ \w{2}/i))  categorizedTransactionData = {Category: "Personal Spending", DescriptionDisplay: "Harbor Freight", Notes: null};


  //Other
  else if (Description.match(/Dollartree \w+ \w{2}/i))  categorizedTransactionData = {Category: null, DescriptionDisplay: "Dollar Tree", Notes: null};
  else if (Description.match(/[\w\* ]+ amzn.com\/billwa/i))  categorizedTransactionData = {Category: null, DescriptionDisplay: "Amazon", Notes: null};

  //Final categorizedTransactionData
  categorizedTransactionData = {
    //only add a category/displayed description/notes, based on the description, if one is not already present
    Category: nullCoalesce(Category, categorizedTransactionData.Category),
    DescriptionDisplay: nullCoalesce(DescriptionDisplay, categorizedTransactionData.DescriptionDisplay),
    Notes: nullCoalesce(Notes, categorizedTransactionData.Notes),
  };

  //Return the transaction with updated categorization data
  return {
    ...transaction,
    ...categorizedTransactionData
  };
};

export const importTransactions = function(transactionsData, dataType) {
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
      const transactionsArray = transactionsData.split("POSTED:")
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
          DescriptionDisplay: null,
          Type: matches[8],
          Amount: Number(`${matches[9]}${matches[10]}`.replace(",","")) * -1,
          Tags: transaction.Tags || [],
        };

        return transactionObj;
      })
      .reverse();
    }
    //Otherwise, this is CSV or JSON data
    else {
      //If CSV data, convert it to JSON
      if (dataType === "csv") transactionsData = transactionsData.map(csvData=>convertCSVToJSON(csvData)).flat();

      //For each CSV file, convert the contents to JSON
      transactions = transactionsData.map(transaction=>{
        //Validate calculated values
        const type = nullCoalesce(transaction.Type, (transaction.Charges ? "Charges" : (transaction.Payments ? "Payments" : null)));
        const transactionDate = convertDateStringToDate(nullCoalesce(transaction.TransactionDate, transaction.Date));
        if (isFalsy(type) || isFalsy(transactionDate)) throw new Error(`Unable to read transaction.\r\n${transaction}`);

        const transactionObj = {
          PostedDate: (!isFalsy(transaction.PostedDate) ? convertDateStringToDate(transaction.PostedDate) : null),
          TransactionDate: transactionDate,
          Card: nullCoalesce(transaction.Card, `*${transaction["Card No."]}`),
          Description: transaction.Description,
          DescriptionDisplay: null,
          Type: type,
          Amount: Number(nullCoalesce(!isFalsy(transaction.Amount) && transaction.Amount.replace("$",''), `${(type === "Charges" ? "-" : "")}${transaction[type]}`)),
          Category: nullCoalesce(transaction.Category),
          Notes: nullCoalesce(transaction.Notes),
          Tags: transaction.Tags || [],
        };

        return transactionObj;
      });
    }

    //Return the transaction objects
    return transactions;
  }
  catch (err) {
    throw err;
  }
};

export const saveTransactions = function(transactions) {
  localStorage.setItem(transactionLocalStorageItemKey, JSON.stringify(transactions));
};

export const fetchTransactions = function() {
  //Attempt to fetch the transactions data from localStorage
  const transactions = JSON.parse(localStorage.getItem(transactionLocalStorageItemKey));
  if (isFalsy(transactions)) return [];

  //Return the transactions
  return transactions;
};

export const formatTransactionDisplay = function(transaction) {
  return {
    ...transaction,
    PostedDate: (transaction.PostedDate ? new Date(transaction.PostedDate).toLocaleDateString().toString() : ""),
    TransactionDate: (transaction.TransactionDate ? new Date(transaction.TransactionDate).toLocaleDateString().toString() : ""),
    Type: transaction.Type || "",
    Category: transaction.Category || "",
    Notes: transaction.Notes || "",
    Amount: transaction.Amount || "",
    DescriptionDisplay: nullCoalesce(transaction.DescriptionDisplay, transaction.Description && `*${transaction.Description.replace(/([\w\'&]+)/g, p1=>p1[0].toUpperCase() + p1.substring(1).toLowerCase())}`),
    Amount: convertNumberToCurrency(transaction.Amount),
  };
};

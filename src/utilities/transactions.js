import {isFalsy, nullCoalesce, convertNumberToCurrency, convertCSVToJSON, convertDateStringToDate, areObjectsEqual, getBudgetCycleFromDate, getBudgetCycleString} from './../utilities';
import {parseGoogleSheetsNumber, parseGoogleSheetsDate} from './../googleApi';

//Declare private functions
const toPascalCase = phrase=>{
  return phrase.split(" ").map(word=>word[0].toUpperCase() + word.substring(1).toLowerCase()).join(" ");
};

//Declare public functions
export const typeCheckTransactions = function (transactions) {
  return transactions.map(transaction=>(
    {
      ...transaction,
      PostedDate: parseGoogleSheetsDate(transaction.PostedDate),
      TransactionDate: parseGoogleSheetsDate(transaction.TransactionDate),
      Amount: parseGoogleSheetsNumber(isNaN(transaction.Amount) ? transaction.Amount.replace(/(\$|,)/g, "") : transaction.Amount),
      Tags: !isFalsy(transaction.Tags) ? transaction.Tags : [],
      BudgetCycle: parseGoogleSheetsDate(transaction.BudgetCycle),
      DateCreated: parseGoogleSheetsDate(transaction.DateCreated),
      DateModified: parseGoogleSheetsDate(transaction.DateModified),
    }
  ));
};

export const importTransactions = function(transactionsData, dataType) {
  try {
    //if this is scraped from online app
    if (dataType === "scraped") {
      return transactionsData
        /* Break out the text data into an Array of data lines */
        .split(/(?:\r\n|\r|\n)/)
        /* Filter out invalid transaction data lines */
        .filter(transactionDataLine=>{
          if (
            !transactionDataLine ||
            transactionDataLine.match(/(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec) \d{2}, \d{4}/) ||
            transactionDataLine.match(/Posted Balance : \$[\d,\.]+/)
          ) {
            console.warn(`Unable to read transaction line.\r\n${transactionDataLine}`);
            return false;
          }
          return true;
        })
        /* Reduce the transaction data lines into composite transactions objects */
        .reduce((transactions, transactionDataLine, i)=>{
          //Make an array of the different pieces of
          // transaction data this line could represent
          const newTransactionDataParts = [
            {
              name: "Description",
              isMatch: transactionDataLine.match(/(.+)/),
              value: (transactionDataLine.match(/(.+)/) ? transactionDataLine.match(/(.+)/)[1] : null),
            },
            {
              name: "TransactionDate",
              isMatch: transactionDataLine.match(/(\d{2}\/\d{2}\/\d{4})/),
              value: (transactionDataLine.match(/(\d{2}\/\d{2}\/\d{4})/) ? convertDateStringToDate(transactionDataLine.match(/(\d{2}\/\d{2}\/\d{4})/)[1], "MM/dd/yyyy") : null),
            },
            {
              name: "Amount",
              isMatch: transactionDataLine.match(/(-?)\$([\d,]+\.\d{2})/),
              value: (transactionDataLine.match(/(-?)\$([\d,]+\.\d{2})/) ? Number(`${transactionDataLine.match(/(-?)\$([\d,]+\.\d{2})/)[1]}${transactionDataLine.match(/(-?)\$([\d,]+\.\d{2})/)[2].replace(",","")}`) : null),
            },
          ];

          //Determine which piece of transaction data this line represents,
          // based on the transaction data line number
          const newTransactionDataPart = newTransactionDataParts[i%newTransactionDataParts.length];

          //Determine whether this is a new transaction's data,
          // based on the transaction data line number
          const isNewTransaction = i%newTransactionDataParts.length===0;

          //If the line doesn't match the expected transaction data regex,
          // skip this transaction line with a warning
          if(!newTransactionDataPart.isMatch) {
            console.warn(`Unable to read transaction line.\r\n${transactionDataLine}`);
            return transactions;
          }

          //Initialize the transaction data variables as all null,
          // with the exception of the current data line
          const newTransactionData = {
            Description: null,
            TransactionDate: null,
            Amount: null,
            [newTransactionDataPart.name]: newTransactionDataPart.value,
          };

          //Get the current date
          const currentDate = new Date();

          //Either build a new transaction object if this is a new transaction's data,
          // or use a previously built one if still on the previous transaction's data
          const transaction = (
            !isNewTransaction ?
            transactions[transactions.length-1] :
            {
              PostedDate: null,
              TransactionDate: newTransactionData.TransactionDate,
              AccountNumber: null,
              Type: null,
              Description: newTransactionData.Description,
              DescriptionDisplay: null,
              Amount: newTransactionData.Amount,
              Category: null,
              Notes: null,
              Tags: [],
              BudgetCycle: null,
              IsAutoCategorized: false,
              IsUpdatedByUser: false,
              DateCreated: currentDate,
              DateModified: currentDate,
            }
          );

          //As the BudgetCycle depends on the TransactionDate,
          // add it when the TransactionDate is found
          if (newTransactionDataPart.name === "TransactionDate") transaction.BudgetCycle = getBudgetCycleFromDate(newTransactionData.TransactionDate);

          //If this is a new transaction, add it to the transactions
          if (isNewTransaction) return transactions.concat(transaction);

          //Otherwise, modify the previous transaction
          // with the new data and return the transactions
          transaction[newTransactionDataPart.name] = newTransactionDataPart.value;
          return transactions;
        }, [])
        /* Import transactions in ascending TransactionDate order */
        .reverse();
    }

    //Otherwise, this is CSV or JSON data

    //If CSV data, convert it to JSON first
    if (dataType === "csv") transactionsData = transactionsData.map(csvData=>convertCSVToJSON(csvData)).flat();

    //For each CSV file, convert the contents to JSON
    return transactionsData.map(transaction=>{
      const _Date = (transaction.Date ? transaction.Date.trim() : null);
      const PostedDate = (transaction.PostedDate ? transaction.PostedDate.trim() : null);
      const TransactionDate = (transaction.TransactionDate ? transaction.TransactionDate.trim() : null);
      const AccountNumber = (transaction["Card No."] ? transaction["Card No."].trim() : null);
      const Type = (transaction.Type ? transaction.Type.trim() : null);
      const Description = (transaction.Description ? transaction.Description.trim() : null);
      const Charges = (transaction.Charges ? transaction.Charges.trim() : null);
      const Payments = (transaction.Payments ? transaction.Payments.trim() : null);
      const Debit = (transaction.Debit ? transaction.Debit.trim() : null);
      const Credit = (transaction.Credit ? transaction.Credit.trim() : null);

      //Get the current date
      const currentDate = new Date();

      //Validate calculated values
      const type = (
        Object.keys(transaction).includes("Credit") && Object.keys(transaction).includes("Debit") ?
          //Checking/Savings account
          nullCoalesce(Type, (Credit && (Number(Credit) || Credit !== "0") ? "Credit" : (Debit && (Number(Debit) || Debit !== "0") ? "Debit" : null))) : (
          Object.keys(transaction).includes("Charges") && Object.keys(transaction).includes("Payments") ?
          //Credit Card account
          nullCoalesce(Type, (Charges && (Number(Charges) || Charges !== "0") ? "Charges" : (Payments && (Number(Payments) || Payments !== "0") ? "Payments" : null))) :
          null
        )
      );
      const transactionDate = convertDateStringToDate(nullCoalesce(TransactionDate, _Date), "MM/dd/yyyy");
      if (isFalsy(type) || isFalsy(transactionDate)) throw new Error(`Unable to read transaction.\r\n${transaction}`);

      return {
        PostedDate: (PostedDate ? convertDateStringToDate(PostedDate, "MM/dd/yyyy") : null),
        TransactionDate: transactionDate,
        AccountNumber: (AccountNumber ? `*${AccountNumber}` : null),
        Type: type,
        Description,
        DescriptionDisplay: null,
        Amount: Number(`${(["Charges","Debit"].includes(type) ? "-" : "")}${transaction[type]}`),
        Category: null,
        Notes: null,
        Tags: [],
        BudgetCycle: getBudgetCycleFromDate(transactionDate),
        IsAutoCategorized: false,
        IsUpdatedByUser: false,
        DateCreated: currentDate,
        DateModified: currentDate,
      };
    });
  }
  catch (err) {
    throw err;
  }
};

export const categorizeTransactionByDescription = function(transaction) {
  const {DescriptionDisplay, Description, Category, Notes} = transaction;

  //If
  // 1) the transaction has already either
  // been auto-categorized, or updated by the user, or
  // 2) the transaction has no Description to categorized on,
  // there is no need to auto-categorized this transaction,
  // as either it has been auto-categorized, or the user
  // manually updated the transaction data
  if (
    (isTransactionAutoCategorizedOrUpdatedByUser(transaction)) ||
    !Description
  ) return transaction;

  //Define a base for categorized transaction data
  let categorizedTransactionData = {};

  //Define matches, if matched capture groups are needed
  let matches;

  //Income
  // NOTE: Always sets budget cycle values to the next month's budget cycle
       if (matches = Description.match(/ELECTRONIC\/ACH CREDIT (\w{5} \w{2} , \w{3}\.) PAYROLL \d{10}/i))  categorizedTransactionData = {Category: "Infor payroll", DescriptionDisplay: `${matches[1]}`, Notes: null, /*BudgetCycle: getBudgetCycleFromDate(new Date(TransactionDate.getMonth()+1))*/};
  else if (matches = Description.match(/INTEREST PAYMENT PAID THIS STATEMENT THRU (\d{2})\/(\d{2})/i))  categorizedTransactionData = {Category: "Other income", DescriptionDisplay: `Interest paid ${matches[1]}/${matches[2]}`, Notes: null, /*BudgetCycle: getBudgetCycleFromDate(new Date(TransactionDate.getMonth()+1))*/};

  //Deposits
  else if (Description.match(/MOBILE CHECK DEPOSIT/i))  categorizedTransactionData = {Category: null, DescriptionDisplay: "Mobile check deposit", Notes: null};

  //Withdrawals
  else if (Description.match(/ATM CASH WITHDRAWAL (?:\d{4} \w{4} \d{12}|[\w ]+)/i))  categorizedTransactionData = {Category: null, DescriptionDisplay: "ATM withdrawal", Notes: null};

  //Transfers
  else if (matches = Description.match(/ONLINE BANKING TRANSFER (?:CREDIT )?(?:MOBILE APP TRANSFER )?(To|From) (?:\d{4} )?\d{9}(\d{4})/i))  categorizedTransactionData = {Category: null, DescriptionDisplay: `Transfer ${matches[1].toLowerCase()} *${matches[2]}`, Notes: null};
  else if (matches = Description.match(/AUTOMATIC TRANSFER DEBIT \w+ \w+ TRANSFER \d{9}(\d{4})-\d \d{10}/i))  categorizedTransactionData = {Category: null, DescriptionDisplay: `Automatic transfer to *${matches[1]}`, Notes: null};
  else if (matches = Description.match(/ZELLE TRANSFER (TO|FROM) ([\w ]+) \d{2}\/\d{2} \w+/i))  categorizedTransactionData = {Category: null, DescriptionDisplay: `Zelle transfer ${matches[1].toLowerCase()} ${toPascalCase(matches[2])}`, Notes: null};

  //Payments
  else if (matches = Description.match(/CREDIT CARD PAYMENT (?:MOBILE APP PAYMENT|ONLINE BANKING TRANSFER) TO \d{4} \d{6}\*{6}(\d{4})/i))  categorizedTransactionData = {Category: null, DescriptionDisplay: `Payment for CCD *${matches[1]}`, Notes: null};
  else if (matches = Description.match(/PAYMENT - \w{5} \w{3} \w{7} \w{2}/i))  categorizedTransactionData = {Category: null, DescriptionDisplay: `Credit card payment`, Notes: null};

  //Bills
  else if (Description.match(/ELECTRONIC\/ACH DEBIT PIEDMONT N\. G\. DRAFT \d{13} \d{10}/i))  categorizedTransactionData = {Category: "Piedmont Natural Gas", DescriptionDisplay: "Piedmont Natural Gas", Notes: null};
  else if (Description.match(/ELECTRONIC\/ACH DEBIT DUKEENERGY BILL PAY \d{12} \w{10}/i))  categorizedTransactionData = {Category: "Duke Energy", DescriptionDisplay: "Duke Energy", Notes: null};
  else if (Description.match(/ELECTRONIC\/ACH DEBIT SHARONVIEW FEDER RE PAYMENT \d{10} \d{10}/i))  categorizedTransactionData = {Category: "Sharonview mortgage & escrow", DescriptionDisplay: "Sharonview mortgage", Notes: null};
  else if (Description.match(/ELECTRONIC\/ACH DEBIT THOMASEHANNAHYMC PURCHASE \d{10}/i))  categorizedTransactionData = {Category: "YMCA membership", DescriptionDisplay: "YMCA membership", Notes: null};
  else if (Description.match(/Simplisafe 888-957-4675 Ma/i))  categorizedTransactionData = {Category: "SimpliSafe (for mom)", DescriptionDisplay: "SimpliSafe", Notes: null};
  else if (Description.match(/SDC\*Laurens Electric C Laurens SC/i))  categorizedTransactionData = {Category: "Laurens Electric ProTec Security", DescriptionDisplay: "Laurens Electric ProTec Security", Notes: null};
  else if (Description.match(/SJWD Water District 8649492805 SC/i))  categorizedTransactionData = {Category: "SJWD Water District", DescriptionDisplay: "SJWD Water", Notes: null};
  else if (Description.match(/State Farm Insurance 8009566310 Il/i))  categorizedTransactionData = {Category: "State Farm auto insurance", DescriptionDisplay: "State Farm", Notes: null};
  else if (Description.match(/Spotify USA(?: New York NY)?/i))  categorizedTransactionData = {Category: "Spotify Premium subscription", DescriptionDisplay: "Spotify Premium", Notes: null};
  else if (Description.match(/Netflix.Com Netflix.Com Ca/i))  categorizedTransactionData = {Category: "Netflix Premium subscription", DescriptionDisplay: "Netflix Premium", Notes: null};
  else if (Description.match(/Ddv \*Discoveryplus 0123456789 TN/i))  categorizedTransactionData = {Category: "Discovery Plus subscription", DescriptionDisplay: "Discovery Plus", Notes: null};
  else if (Description.match(/(?:AT&T \*Payment|ATT\*BILL PAYMENT) 800-288-2020 TX/i))  categorizedTransactionData = {Category: "AT&T Internet", DescriptionDisplay: "AT&T Internet", Notes: null};
  else if (Description.match(/KIRBY SANITATION (?:\/C&J E )?8648778887 SC/i))  categorizedTransactionData = {Category: "Kirby Sanitation", DescriptionDisplay: "Kirby Sanitation", Notes: null};

  //Recurring expenses

  //Gas
  else if (Description.match(/QT \d+ (?:INSIDE|OUTSIDE|\w+ \w{2})/i)) categorizedTransactionData = {Category: "Gas", DescriptionDisplay: "QuikTrip", Notes: null};
  else if (Description.match(/CIRCLE K # \d+ \w+ \w{2}/i)) categorizedTransactionData = {Category: "Gas", DescriptionDisplay: "Circle K", Notes: null};
  else if (Description.match(/7-ELEVEN \d+ \w+ \w{2}/i)) categorizedTransactionData = {Category: "Gas", DescriptionDisplay: "7-Eleven", Notes: null};
  else if (Description.match(/SPINX #\d+ \w+ \w{2}/i)) categorizedTransactionData = {Category: "Gas", DescriptionDisplay: "Spinx", Notes: null};
  else if (Description.match(/LOVE S TRAVEL \d+ [\w ]+ \w{2}/i)) categorizedTransactionData = {Category: "Gas", DescriptionDisplay: "Love's", Notes: null};
  else if (Description.match(/SHELL OIL [\d\w]+ [\w ]+ \w{2}/i)) categorizedTransactionData = {Category: "Gas", DescriptionDisplay: "Shell", Notes: null};
  else if (Description.match(/INGLES GAS EXP #\d+ \w+ \w{2}/i)) categorizedTransactionData = {Category: "Gas", DescriptionDisplay: "Ingles Gas", Notes: null};

  //Groceies & Necessities
  else if (Description.match(/Walmart Grocery [\d-]+ Ar/i)) categorizedTransactionData = {Category: "Groceries/Necessities", DescriptionDisplay: "Walmart Supercenter", Notes: "grocery pickup"};
  else if (Description.match(/(?:Wal-Mart|WM Supercenter) #\d+ \w+ \w{2}/i)) categorizedTransactionData = {Category: "Groceries/Necessities", DescriptionDisplay: "Walmart Supercenter", Notes: null};
  else if (Description.match(/Target #?\d+ \w+ \w{2}/i)) categorizedTransactionData = {Category: "Groceries/Necessities", DescriptionDisplay: "Target", Notes: null};
  else if (Description.match(/Ingles Markets #\d+ \w+ \w{2}/i)) categorizedTransactionData = {Category: "Groceries/Necessities", DescriptionDisplay: "Ingles", Notes: null};
  else if (Description.match(/Publix #\d+ \w+ \w{2}/i)) categorizedTransactionData = {Category: "Groceries/Necessities", DescriptionDisplay: "Publix", Notes: null};
  else if (Description.match(/(?:Sams ?Club #8142 Spartanburg SC|Sams Club #8142 864-574-3480 SC)/i)) categorizedTransactionData = {Category: "Groceries/Necessities", DescriptionDisplay: "Sam's Club", Notes: null};
  else if (Description.match(/Walgreens #\d+/i)) categorizedTransactionData = {Category: "Groceries/Necessities", DescriptionDisplay: "Walgreens", Notes: null};
  else if (Description.match(/Dollar Tree \w+ \w{2}/i)) categorizedTransactionData = {Category: "Groceries/Necessities", DescriptionDisplay: "Dollar Tree", Notes: null};

  //Family Outings
  else if (Description.match(/McDonald's \w+ \w+ \w{2}/i))  categorizedTransactionData = {Category: "Family Outings", DescriptionDisplay: "McDonald's", Notes: null};
  else if (Description.match(/Burger King #\d+(?: \w+ \w+ \w{2})?/i))  categorizedTransactionData = {Category: "Family Outings", DescriptionDisplay: "Burger King", Notes: null};
  else if (Description.match(/Sonic Drive In #\d+ \w+ \w{2}/i))  categorizedTransactionData = {Category: "Family Outings", DescriptionDisplay: "Sonic Drive-In", Notes: null};
  else if (Description.match(/Cook Out [\w ]+(?: \w+ \w{2})?/i))  categorizedTransactionData = {Category: "Family Outings", DescriptionDisplay: "Cook Out", Notes: null};
  else if (Description.match(/Wendys #\d+ \w+ \w{2}/i))  categorizedTransactionData = {Category: "Family Outings", DescriptionDisplay: "Wendy's", Notes: null};
  else if (Description.match(/Krystal [\d\w]+ \w+ \w{2}/i))  categorizedTransactionData = {Category: "Family Outings", DescriptionDisplay: "Krystal", Notes: null};
  else if (Description.match(/Checkers Drive In \w+ \w{2}/i))  categorizedTransactionData = {Category: "Family Outings", DescriptionDisplay: "Checkers", Notes: null};
  else if (Description.match(/Jack in the Box \d+ \w+/i))  categorizedTransactionData = {Category: "Family Outings", DescriptionDisplay: "Jack In The Box", Notes: null};
  else if (Description.match(/Wayback Burgers \w+ \w{2}/i))  categorizedTransactionData = {Category: "Family Outings", DescriptionDisplay: "Wayback Burgers", Notes: null};
  else if (Description.match(/Arbys - \d+ \w+ \w{2}/i))  categorizedTransactionData = {Category: "Family Outings", DescriptionDisplay: "Arby's", Notes: null};
  else if (Description.match(/PDQ \d+ (OLO )?Greenville SC/i))  categorizedTransactionData = {Category: "Family Outings", DescriptionDisplay: "PDQ", Notes: null};
  else if (Description.match(/Chick-Fil-A #\d+ \w+ \w{2}/i))  categorizedTransactionData = {Category: "Family Outings", DescriptionDisplay: "Chick-fil-A", Notes: null};
  else if (Description.match(/Bojangles \d+ \w+/i))  categorizedTransactionData = {Category: "Family Outings", DescriptionDisplay: "Bojangles", Notes: null};
  else if (Description.match(/KFC \w+ \w+ \w{2}/i))  categorizedTransactionData = {Category: "Family Outings", DescriptionDisplay: "KFC", Notes: null};
  else if (Description.match(/Popeyes \d+ \w+ \w{2}/i))  categorizedTransactionData = {Category: "Family Outings", DescriptionDisplay: "Popeyes", Notes: null};
  else if (Description.match(/Taco Bell #\d+ \w+ \w{2}/i))  categorizedTransactionData = {Category: "Family Outings", DescriptionDisplay: "Taco Bell", Notes: null};
  else if (Description.match(/(?:Chipotle \d+ \w+ \w{2}|Chipotle Online 1800\d{6} CA)/i))  categorizedTransactionData = {Category: "Family Outings", DescriptionDisplay: "Chipotle", Notes: null};
  else if (Description.match(/Taco Casa #\d+ \w+ \w{2}/i))  categorizedTransactionData = {Category: "Family Outings", DescriptionDisplay: "Taco Casa", Notes: null};
  else if (Description.match(/TST\* WILLY TACO - HUB SPARTANBURG SC/i))  categorizedTransactionData = {Category: "Family Outings", DescriptionDisplay: "Willy Taco", Notes: null};
  else if (Description.match(/El Tejano Mexican Rest/i))  categorizedTransactionData = {Category: "Family Outings", DescriptionDisplay: "El Tejano", Notes: null};
  else if (Description.match(/La Fogata Mexican Rest Simpsonville Sc/i))  categorizedTransactionData = {Category: "Family Outings", DescriptionDisplay: "La Fogata", Notes: null};
  else if (Description.match(/El Molcajete Duncan Sc/i))  categorizedTransactionData = {Category: "Family Outings", DescriptionDisplay: "El Molcajete", Notes: null};
  else if (Description.match(/CKE\*TACO DOG SPARTANBU SPARTANBURG SC/i))  categorizedTransactionData = {Category: "Family Outings", DescriptionDisplay: "Taco Dog", Notes: null};
  else if (Description.match(/Tropical Grille \w+ \w{2}/i))  categorizedTransactionData = {Category: "Family Outings", DescriptionDisplay: "Tropical Grille", Notes: null};
  else if (Description.match(/WAFFLE HOUSE \d+ \w+ \w{2}/i))  categorizedTransactionData = {Category: "Family Outings", DescriptionDisplay: "Waffle House", Notes: null};
  else if (Description.match(/Chili's \w+ \w+ \w{2}/i))  categorizedTransactionData = {Category: "Family Outings", DescriptionDisplay: "Chili's", Notes: null};
  else if (Description.match(/Paisanos Italian Resta/i))  categorizedTransactionData = {Category: "Family Outings", DescriptionDisplay: "Paisanos Italian Restaurant", Notes: null};
  else if (Description.match(/Sweet Basil Thai Cusin Greenville SC/i))  categorizedTransactionData = {Category: "Family Outings", DescriptionDisplay: "Sweet Basil Thai Cusine", Notes: null};
  else if (Description.match(/Panda Hibachi Duncan SC/i))  categorizedTransactionData = {Category: "Family Outings", DescriptionDisplay: "Panda Hibachi", Notes: null};
  else if (Description.match(/PF Changs #\d+ \w+ \w{2}/i))  categorizedTransactionData = {Category: "Family Outings", DescriptionDisplay: "PF Changs", Notes: null};
  else if (Description.match(/Pizza Hut \d+ \d+ \w{2}/i))  categorizedTransactionData = {Category: "Family Outings", DescriptionDisplay: "Pizza Hut", Notes: null};
  else if (Description.match(/Tutti Frutti Spartanburg SC/i))  categorizedTransactionData = {Category: "Family Outings", DescriptionDisplay: "Tutti Frutti", Notes: null};
  else if (Description.match(/KRISPY KREME \d+ \w+ \w{2}/i))  categorizedTransactionData = {Category: "Family Outings", DescriptionDisplay: "Krispy Kreme", Notes: null};
  else if (Description.match(/IHOP \d+ \w+ \w{2}/i))  categorizedTransactionData = {Category: "Family Outings", DescriptionDisplay: "IHOP", Notes: null};
  else if (Description.match(/Applebees \d+ \w+ \w{2}/i))  categorizedTransactionData = {Category: "Family Outings", DescriptionDisplay: "Applebee's", Notes: null};
  else if (Description.match(/Dunkin #\d+ \w+ \w+ \w{2}/i))  categorizedTransactionData = {Category: "Family Outings", DescriptionDisplay: "Dunkin", Notes: null};
  else if (Description.match(/Shipwreck Cove Duncan SC/i))  categorizedTransactionData = {Category: "Family Outings", DescriptionDisplay: "Shipwreck Cove", Notes: null};

  //Church
  else if (Description.match(/Brookwood Church Donat Simpsonville Sc/i))  categorizedTransactionData = {Category: "Church", DescriptionDisplay: "Brookwood Church", Notes: "online giving"};

  //Personal Spending
  else if (Description.match(/HARBOR FREIGHT TOOLS \d \w+ \w{2}/i))  categorizedTransactionData = {Category: "Personal Spending", DescriptionDisplay: "Harbor Freight", Notes: null};
  else if (Description.match(/The Home Depot #\d+ \w+ \w{2}/i))  categorizedTransactionData = {Category: "Personal Spending", DescriptionDisplay: "The Home Depot", Notes: null};

  //Other
  else if (Description.match(/Dollartree \w+ \w{2}/i))  categorizedTransactionData = {Category: null, DescriptionDisplay: "Dollar Tree", Notes: null};
  else if (Description.match(/[\w\* ]+ amzn.com\/billwa/i))  categorizedTransactionData = {Category: null, DescriptionDisplay: "Amazon", Notes: null};
  else if (Description.match(/SPARTANBURGCO TREAS 8645962603 SC/i))  categorizedTransactionData = {Category: "Miscellaneous", DescriptionDisplay: "Spartanburg County Treasury", Notes: null};
  else if (matches = Description.match(/ELECTRONIC\/ACH CREDIT IRS TREAS 310 ([\w ]+) \d{10}/i))  categorizedTransactionData = {Category: "Miscellaneous", DescriptionDisplay: `Internal Revenue Service ${matches[1]}`, Notes: null};

  //If there was no match, return the original transaction
  else return transaction;

  //Final categorizedTransactionData
  categorizedTransactionData = {
    //only add a category/displayed description/notes, based on the description, if one is not already present
    Category: Category || categorizedTransactionData.Category,
    DescriptionDisplay: DescriptionDisplay || categorizedTransactionData.DescriptionDisplay,
    Notes: Notes || categorizedTransactionData.Notes,
    //BudgetCycle: categorizedTransactionData.BudgetCycle,
  };

  //Return the transaction with updated categorization data
  return {
    ...transaction,
    ...categorizedTransactionData,
    IsAutoCategorized: true,
  };
};

export const getTransactionDefaultDescriptionDisplay = function(transaction) {
  return nullCoalesce(transaction.DescriptionDisplay, `*${transaction.Description}`) || "";
};

export const formatTransactionDisplay = function(transaction) {
  return {
    ...transaction,
    BudgetCycle: (transaction.BudgetCycle ? getBudgetCycleString(transaction.BudgetCycle) : ""),
    PostedDate: (transaction.PostedDate ? new Date(transaction.PostedDate).toLocaleDateString().toString() : ""),
    TransactionDate: (transaction.TransactionDate ? new Date(transaction.TransactionDate).toLocaleDateString().toString() : ""),
    AccountNumber: transaction.AccountNumber || "",
    Type: transaction.Type || "",
    Description: transaction.Description || "",
    DescriptionDisplay: transaction.DescriptionDisplay || "",
    Amount: convertNumberToCurrency(transaction.Amount) || "",
    Category: transaction.Category || "",
    Notes: transaction.Notes || "",
  };
};

export const isTransactionDuplicate = (potentialDuplicate, transactions)=>{
  return transactions.find(transaction=>
    areObjectsEqual({
      TransactionDate: transaction.TransactionDate.toJSON(),
      Description: transaction.Description,
      Amount: transaction.Amount,
    }, {
      TransactionDate: potentialDuplicate.TransactionDate.toJSON(),
      Description: potentialDuplicate.Description,
      Amount: potentialDuplicate.Amount,
    }
  ));
};

export const getBudgetCyclesFromTransactions = transactions=>{
  return [
    ...new Set(
      transactions.map(({BudgetCycle})=>getBudgetCycleFromDate(BudgetCycle))
    )
  ].map(date=>new Date(date));
};

export const isTransactionAutoCategorizedOrUpdatedByUser = transaction=>{
  return transaction.IsAutoCategorized === true || transaction.IsUpdatedByUser === true;
};

export const getTransactionsAmountTotal = transactions=>{
  return transactions.reduce((total, transaction)=>total+=transaction.Amount, 0);
};

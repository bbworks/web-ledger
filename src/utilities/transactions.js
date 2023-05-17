import {isFalsy, nullCoalesce, convertNumberToCurrency, convertCSVToJSON, convertDateStringToDate, areObjectsEqual, getBudgetCycleFromDate, getBudgetCycleString} from './../utilities';
import {parseGoogleSheetsNumber, parseGoogleSheetsDate} from './../googleApi';

//Declare private functions
const toPascalCase = phrase=>{
  return phrase.split(" ").map(word=>word[0].toUpperCase() + word.substring(1).toLowerCase()).join(" ");
};

//Declare public functions
export const typeCheckTransactions = function (transactions) {
  return transactions.map(transaction=>{
    try {
      return {
        ...transaction,
        TransactionId: parseGoogleSheetsNumber(transaction.TransactionId),
        PostedDate: parseGoogleSheetsDate(transaction.PostedDate),
        TransactionDate: parseGoogleSheetsDate(transaction.TransactionDate),
        Amount: parseGoogleSheetsNumber(isNaN(transaction.Amount) ? transaction.Amount.replace(/(\$|,)/g, "") : transaction.Amount),
        Tags: !isFalsy(transaction.Tags) ? transaction.Tags : [],
        BudgetCycle: parseGoogleSheetsDate(transaction.BudgetCycle),
        DateCreated: parseGoogleSheetsDate(transaction.DateCreated),
        DateModified: parseGoogleSheetsDate(transaction.DateModified),
      };
    }
    catch (err) {
      console.error(transaction);
      throw err;
    }
  });
};

export const importTransactions = function(transactionsData, dataType) {
  try {
    //Get the current date
    const importDate = new Date();

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
            transactionDataLine.match(/Posted Balance: \$[\d,\.]+/) ||
            transactionDataLine.match(/^- view details for/)
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

          //Either build a new transaction object if this is a new transaction's data,
          // or use a previously built one if still on the previous transaction's data
          const transaction = (
            !isNewTransaction ?
            transactions[transactions.length-1] :
            {
              TransactionId: null,
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
              DateCreated: importDate,
              DateModified: importDate,
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
      const TransactionType = (transaction["Transaction Type"] ? transaction["Transaction Type"].trim() : null);
      const Description = (transaction.Description ? transaction.Description.trim() : null);
      const Amount = (transaction.Amount ? transaction.Amount.trim() : null);
      const Charges = (transaction.Charges ? transaction.Charges.trim() : null);
      const Payments = (transaction.Payments ? transaction.Payments.trim() : null);
      const Debit = (transaction.Debit ? transaction.Debit.trim() : null);
      const Credit = (transaction.Credit ? transaction.Credit.trim() : null);

      //Validate calculated values
      const amountRegEx = Amount.match(/(\()?\$\+?(\d+(?:\.\d{1,2})?)(\))?/);
      const amountIsNegative = amountRegEx[1] && amountRegEx[3];
      let amount = Number(amountIsNegative ? `-${amountRegEx[2]}` : amountRegEx[2]);

      let type = TransactionType;

      //If this is a credit card transaction,
      // negate the amount and change the transaction type
      if (
        !amountIsNegative && type === "Debit" ||
        amountIsNegative && type === "Credit"
      )
      {
        amount *= -1;
        type = (type==="Debit" ? "Charges" : (type==="Credit" ? "Payments" : null));
      }

      const transactionDate = convertDateStringToDate(nullCoalesce(TransactionDate, _Date), "MM/dd/yyyy");
      if (isFalsy(type) || isFalsy(transactionDate)) {
        console.error(transaction);
        throw new Error(`Unable to read transaction.\r\n${Object.entries(transaction).map(([key,value])=>`${key}:${value}`).join(", ")}`);
      }


      return {
        TransactionId: null,
        PostedDate: (PostedDate ? convertDateStringToDate(PostedDate, "MM/dd/yyyy") : null),
        TransactionDate: transactionDate,
        AccountNumber: (AccountNumber ? `*${AccountNumber}` : null),
        Type: type,
        Description,
        DescriptionDisplay: null,
        Amount: amount,
        Category: null,
        Notes: null,
        Tags: [],
        BudgetCycle: getBudgetCycleFromDate(transactionDate),
        IsAutoCategorized: false,
        IsUpdatedByUser: false,
        DateCreated: importDate,
        DateModified: importDate,
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
       if (matches = Description.match(/(?:ELECTRONIC\/ACH CREDIT (.+) PAYROLL \d{10}|PAYROLL (.+) \d+ [\w ]+ ACH CREDIT)/i))  categorizedTransactionData = {Category: "Infor payroll", DescriptionDisplay: `${matches[1] ?? matches[2]}`, Notes: null, /*BudgetCycle: getBudgetCycleFromDate(new Date(TransactionDate.getUTCMonth()+1))*/};
  else if (matches = Description.match(/INTEREST(?: PAYMENT)?(?: INTEREST)?(?: PAID THIS STATEMENT THRU (\d{2})\/(\d{2}))?/i))  categorizedTransactionData = {Category: "Other income", DescriptionDisplay: `Interest paid${(matches[1] && matches[2] ? ` ${matches[1]}/${matches[2]}` : "")}`, Notes: null, /*BudgetCycle: getBudgetCycleFromDate(new Date(TransactionDate.getUTCMonth()+1))*/};

  //Charges
  else if (Description.match(/INTEREST CHARGE/i))  categorizedTransactionData = {Category: "Miscellaneous", DescriptionDisplay: "Interest charge", Notes: null};

  //Deposits
  else if (Description.match(/MOBILE CHECK DEPOSIT/i))  categorizedTransactionData = {Category: "Miscellaneous", DescriptionDisplay: "Mobile check deposit", Notes: null};

  //Withdrawals
  else if (Description.match(/ATM CASH WITHDRAWAL (?:\d{4} \w{4} \d{12}|[\w ]+)/i))  categorizedTransactionData = {Category: "Miscellaneous", DescriptionDisplay: "ATM withdrawal", Notes: null};
  else if (matches = Description.match(/CHECK #(\d+)/i))  categorizedTransactionData = {Category: "Miscellaneous", DescriptionDisplay: `Check #${matches[1]}`, Notes: null};

  //Transfers
  else if (matches = Description.match(/(?:ONLINE (?:BANKING TRANSFER (?:CREDIT )?(?:MOBILE APP TRANSFER )?)?|MOBILE )(TO|FROM) (?:(?:\d{4} )?\d{9}|\*{14}|\*{4})(\d{4})(?: (?:- )?DEPOSIT TRANSFER)?(.+CREDIT CARD PMT)?/i))  categorizedTransactionData = {Category: "Miscellaneous", DescriptionDisplay: `${matches[3] ? "Payment for CCD" : `Transfer ${matches[1].toLowerCase()}`} *${matches[2]}`, Notes: null};
  else if (matches = Description.match(/(?:AUTOMATIC TRANSFER DEBIT \w+ \w+ TRANSFER \d{9}(\d{4})-\d \d{10}|ACCOUNT NUMBER \d{5}(\d{4}) PREAUTHORIZED TRANSFER)/i))  categorizedTransactionData = {Category: "Miscellaneous", DescriptionDisplay: `Automatic transfer to *${matches[1] ?? matches[2]}`, Notes: null};
  else if (matches = Description.match(/(?:ZELLE TRANSFER (TO|FROM) ([\w ]+) \d{2}\/\d{2} ?\w+|([\w ]+) PAYMENT ID BBT\d+ ZELLE PAYMENT (TO|FROM))/i))  categorizedTransactionData = {Category: "Miscellaneous", DescriptionDisplay: `Zelle transfer ${(matches[1] ?? matches[4]).toLowerCase()} ${toPascalCase((matches[2] ?? matches[3]))}`, Notes: null};
  else if (matches = Description.match(/(PAYMENT|CASHOUT) VENMO \d+ (INTERNET PAYMENT|([\w ]+) ACH CREDIT)/i))  categorizedTransactionData = {Category: "Miscellaneous", DescriptionDisplay: `Venmo ${matches[1].toLowerCase()}${matches[3] ? `from ${toPascalCase(matches[3])}` : ''}`, Notes: null};

  //Payments
  else if (matches = Description.match(/(?:MOBILE TO \*{12}(\d{4}) )?CREDIT CARD PAYMENT(?: (?:MOBILE APP PAYMENT|ONLINE BANKING TRANSFER) TO \d{4} \d{6}\*{6}(\d{4}))?/i))  categorizedTransactionData = {Category: "Miscellaneous", DescriptionDisplay: `Payment for CCD *${matches[1] ?? matches[2]}`, Notes: null};
  else if (matches = Description.match(/PAYMENTS? - \w{5} \w{3}(?: \w{7} \w{2})?/i))  categorizedTransactionData = {Category: "Miscellaneous", DescriptionDisplay: "Credit card payment", Notes: null};

  //Bills
  else if (Description.match(/(?:ELECTRONIC\/ACH DEBIT )?PIEDMONT N\. G\.(?: DRAFT \d{13} \d{10})?/i))  categorizedTransactionData = {Category: "Piedmont Natural Gas", DescriptionDisplay: "Piedmont Natural Gas", Notes: null};
  else if (Description.match(/(?:ELECTRONIC\/ACH DEBIT )?(?:BILL PAY )?DUKE ?ENERGY(?:(?: BILL PAY \d{12}| SE WEB PAY \d{14}) \w{10})?/i))  categorizedTransactionData = {Category: "Duke Energy", DescriptionDisplay: "Duke Energy", Notes: null};
  else if (Description.match(/(?:ELECTRONIC\/ACH DEBIT )?(?:RE PAYMENT )?SHARONVIEW FEDER(?: RE PAYMENT \d{10} \d{10})?/i))  categorizedTransactionData = {Category: "Sharonview mortgage & escrow", DescriptionDisplay: "Sharonview mortgage", Notes: null};
  else if (Description.match(/(?:ELECTRONIC\/ACH DEBIT )?SHARONVIEW FCU TRANSFER \d{15} \d{10}/i))  categorizedTransactionData = {Category: "Sharonview auto loan ", DescriptionDisplay: "Sharonview loan", Notes: null};
  else if (Description.match(/(?:ELECTRONIC\/ACH DEBIT )?(?:PURCHASE )?THOMASEHANNAHYMC(?: PURCHASE \d{10})?/i))  categorizedTransactionData = {Category: "YMCA membership", DescriptionDisplay: "YMCA membership", Notes: null};
  else if (Description.match(/(?:ELECTRONIC\/ACH DEBIT )?PLANET FIT CLUB FEES \d{13} \d{10}/i))  categorizedTransactionData = {Category: "Planet Fitness membership", DescriptionDisplay: "Planet Fitness membership", Notes: null};
  else if (Description.match(/(?:ELECTRONIC\/ACH DEBIT )?DEPT EDUCATION STUDENT LN \w{11} \d{10}/i))  categorizedTransactionData = {Category: "Nelnet student loan", DescriptionDisplay: "Nelnet student loan", Notes: null};
  else if (Description.match(/(?:(?:ELECTRONIC\/ACH DEBIT )?(?:ESCAVERA HOMEOWN|CEDAR MANAGEMENT) DRAFT \w{6} \d{10})/i))  categorizedTransactionData = {Category: "HOA dues", DescriptionDisplay: "HOA dues", Notes: null};
  else if (Description.match(/Simplisafe 888-957-4675 MA/i))  categorizedTransactionData = {Category: "SimpliSafe (for mom)", DescriptionDisplay: "SimpliSafe", Notes: null};
  else if (Description.match(/[SM]DC\* ?Laurens Electric C Laurens SC/i))  categorizedTransactionData = {Category: "Laurens Electric ProTec Security", DescriptionDisplay: "Laurens Electric ProTec Security", Notes: null};
  else if (Description.match(/SJWD Water District (?:8649492805|8888916064) SC/i))  categorizedTransactionData = {Category: "SJWD Water District", DescriptionDisplay: "SJWD Water", Notes: null};
  else if (Description.match(/State Farm  ?Insurance (?:8009566310|BLOOMINGTON) IL/i))  categorizedTransactionData = {Category: "State Farm auto insurance", DescriptionDisplay: "State Farm", Notes: null};
  else if (Description.match(/Spotify USA(?: New York NY)?/i))  categorizedTransactionData = {Category: "Spotify Premium subscription", DescriptionDisplay: "Spotify Premium", Notes: null};
  else if (Description.match(/Netflix.Com Netflix.Com Ca/i))  categorizedTransactionData = {Category: "Netflix Premium subscription", DescriptionDisplay: "Netflix Premium", Notes: null};
  else if (Description.match(/(?:Ddv \*)?Discovery(?:plus|\+) ?(?:Ad-Free )?0123456789 TN/i))  categorizedTransactionData = {Category: "Discovery+ subscription", DescriptionDisplay: "Discovery+ subscription", Notes: null};
  else if (Description.match(/DisneyPlus (?:888-9057888|Burbank) CA/i))  categorizedTransactionData = {Category: "Disney+ subscription", DescriptionDisplay: "Disney+ subscription", Notes: null};
  else if (Description.match(/Peacock \w+ Premium New York NY/i))  categorizedTransactionData = {Category: "Peacock Premium subscription", DescriptionDisplay: "Peacock", Notes: null};
  else if (Description.match(/Spectrum 855-707-7328 \w{2}/i))  categorizedTransactionData = {Category: "Spectrum Internet", DescriptionDisplay: "Spectrum Internet", Notes: null};
  else if (Description.match(/(?:AT&T \*Payment|ATT\*BILL PAYMENT) 800-288-2020 TX/i))  categorizedTransactionData = {Category: "AT&T Internet", DescriptionDisplay: "AT&T Internet", Notes: null};
  else if (Description.match(/PAYMENT 5\/3 INSTALL LOAN REF \d{11} TELEPHONE PAYMENT/i))  categorizedTransactionData = {Category: "Fifth Third auto loan", DescriptionDisplay: "Fifth Third auto loan", Notes: null};
  else if (Description.match(/KIRBY SANITATION(?:\/C&J E)? 8648778887 SC/i))  categorizedTransactionData = {Category: "Kirby Sanitation", DescriptionDisplay: "Kirby Sanitation", Notes: null};
  else if (Description.match(/Food for the Hungry (?:480-9983100|PHOENIX) AZ/i))  categorizedTransactionData = {Category: "Food for the Hungry", DescriptionDisplay: "Food for the Hungry", Notes: null};
  else if (Description.match(/SURE PAY MOSAIC [^ ]+ [\w ]+ ACH DEBIT/i))  categorizedTransactionData = {Category: "Mosaic Financing", DescriptionDisplay: "Mosaic Financing", Notes: null};
  else if (Description.match(/GLOBE LIFE AND ACCIDEN 9725406542 OK/i))  categorizedTransactionData = {Category: "Globe Life insurance", DescriptionDisplay: "Globe Life insurance", Notes: null};
  else if (Description.match(/MICROSOFT\*ONEDRIVE STA REDMOND WA/i))  categorizedTransactionData = {Category: "Microsoft OneDrive subscription", DescriptionDisplay: "Microsoft OneDrive subscription", Notes: null};

  //Recurring expenses

  //Gas
  else if (Description.match(/QT \d+ (?:INSIDE|OUTSIDE|\w+ \w{2})/i)) categorizedTransactionData = {Category: "Gas", DescriptionDisplay: "QuikTrip", Notes: null};
  else if (Description.match(/CIRCLE K (?:# )?\d+ \w+ \w{2}/i)) categorizedTransactionData = {Category: "Gas", DescriptionDisplay: "Circle K", Notes: null};
  else if (Description.match(/7-ELEVEN \d+ \w+ \w{2}/i)) categorizedTransactionData = {Category: "Gas", DescriptionDisplay: "7-Eleven", Notes: null};
  else if (Description.match(/SPINX #\d+ \w+ \w{2}/i)) categorizedTransactionData = {Category: "Gas", DescriptionDisplay: "Spinx", Notes: null};
  else if (Description.match(/(?:LOVE S TRAVEL |LOVE ?S COUNTRY ?)\d+ [\w ]+ \w{2}/i)) categorizedTransactionData = {Category: "Gas", DescriptionDisplay: "Love's", Notes: null};
  else if (Description.match(/SHELL OIL [\d\w]+ [\w ]+ \w{2}/i)) categorizedTransactionData = {Category: "Gas", DescriptionDisplay: "Shell", Notes: null};
  else if (Description.match(/INGLES GAS EXP #\d+ \w+ \w{2}/i)) categorizedTransactionData = {Category: "Gas", DescriptionDisplay: "Ingles Gas", Notes: null};
  else if (Description.match(/RACETRAC ?\d+ \d+ \w+ \w{2}/i)) categorizedTransactionData = {Category: "Gas", DescriptionDisplay: "RaceTrac", Notes: null};
  else if (Description.match(/TA \w+ #\d+ \w+ \w{2}/i)) categorizedTransactionData = {Category: "Gas", DescriptionDisplay: "TA Travel Centers of America", Notes: null};
  else if (Description.match(/SPEEDWAY \d+ \d+ \w+ \w+ \w{2}/i)) categorizedTransactionData = {Category: "Gas", DescriptionDisplay: "Speedway", Notes: null};
  else if (Description.match(/BUC-EE[' ]S #\d+ \w+  ?\w{2}/i)) categorizedTransactionData = {Category: "Gas", DescriptionDisplay: "Buc-ee's", Notes: null};
  else if (Description.match(/V GO #\d+ \w+ \w{2}/i)) categorizedTransactionData = {Category: "Gas", DescriptionDisplay: "V-Go", Notes: null};
  else if (Description.match(/TEXACO \d+ \w+ \w{2}/i)) categorizedTransactionData = {Category: "Gas", DescriptionDisplay: "Texaco", Notes: null};
  else if (Description.match(/EXXONMOBIL \d+ \w+ \w{2}/i)) categorizedTransactionData = {Category: "Gas", DescriptionDisplay: "ExxonMobil", Notes: null};
  else if (Description.match(/[\w ]+ CITGO \w+ \w{2}/i)) categorizedTransactionData = {Category: "Gas", DescriptionDisplay: "Citgo", Notes: null};
  else if (Description.match(/MARATHON PETRO\d+ \w+ \w{2}/i)) categorizedTransactionData = {Category: "Gas", DescriptionDisplay: "Marathon", Notes: null};
  else if (Description.match(/PILOT \d+ \w+ \w{2}/i)) categorizedTransactionData = {Category: "Gas", DescriptionDisplay: "Pilot Flying J", Notes: null};
  else if (Description.match(/Chevron \d+ \w+ \w{2}/i)) categorizedTransactionData = {Category: "Gas", DescriptionDisplay: "Chevron", Notes: null};
  else if (Description.match(/Red Robin Gas Station \w+ \w{2}/i)) categorizedTransactionData = {Category: "Gas", DescriptionDisplay: "Red Robin Gas Station", Notes: null};
  else if (Description.match(/MAPCO \d+ \w+ \w{2}/i)) categorizedTransactionData = {Category: "Gas", DescriptionDisplay: "Mapco", Notes: null};

  //Groceries & Necessities
  else if (Description.match(/Walmart(?: Grocery|\.com(?: AA)?)  ?(?:(?:\d{3}-?\d{3}-?\d{4}|BENTONVILLE|Walmart\.com) ){1,2}AR/i)) categorizedTransactionData = {Category: "Groceries/Necessities", DescriptionDisplay: "Walmart Supercenter", Notes: "grocery pickup"};
  else if (Description.match(/(?:Wal-Mart|WM Supercenter) #\d+ \w+ \w{2}/i)) categorizedTransactionData = {Category: "Groceries/Necessities", DescriptionDisplay: "Walmart Supercenter", Notes: null};
  else if (Description.match(/(?:Target(?: #?\d+ \w+ \w{2}|\.com \* \d{3}-\d{3}-\d{4} MN)|PAYPAL \*TARGETCORPO 4029357733 IN)/i)) categorizedTransactionData = {Category: "Groceries/Necessities", DescriptionDisplay: "Target", Notes: null};
  else if (Description.match(/Ingles Markets #\d+ \w+ \w{2}/i)) categorizedTransactionData = {Category: "Groceries/Necessities", DescriptionDisplay: "Ingles", Notes: null};
  else if (Description.match(/Publix #\d+ \w+ \w{2}/i)) categorizedTransactionData = {Category: "Groceries/Necessities", DescriptionDisplay: "Publix", Notes: null};
  else if (Description.match(/Kroger #\d+ \w+ \w{2}/i)) categorizedTransactionData = {Category: "Groceries/Necessities", DescriptionDisplay: "Kroger", Notes: null};
  else if (Description.match(/Food Lion #\d+ \w+ \w{2}/i)) categorizedTransactionData = {Category: "Groceries/Necessities", DescriptionDisplay: "Food Lion", Notes: null};
  else if (Description.match(/Winn-Dixie   #\d+ \w+ \w{2}/i)) categorizedTransactionData = {Category: "Groceries/Necessities", DescriptionDisplay: "Winn-Dixie", Notes: null};
  else if (Description.match(/(?:Sams ?Club #\d+ \w+ \w{2}|(?:Sams Club #\d+|SAMSCLUB\.COM) \d{3}-\d{3}-\d{4} \w+)/i)) categorizedTransactionData = {Category: "Groceries/Necessities", DescriptionDisplay: "Sam's Club", Notes: null};
  else if (Description.match(/SAMS MEMBERSHIP 888-433-7267 AR/i)) categorizedTransactionData = {Category: "Miscellaneous", DescriptionDisplay: "Sam's Club club membership", Notes: null};
  else if (Description.match(/(WWW COSTCO COM 800-955-2292 WA|COSTCO WHSE #\d+ \d{2}-\d{2}-\d{2} \w+ \w{2} \d+ DEBIT CARD PURCHASE-PIN)/i)) categorizedTransactionData = {Category: "Groceries/Necessities", DescriptionDisplay: "Costco Wholesale", Notes: null};
  else if (Description.match(/Lidl #\d+ \w+ \w{2}/i)) categorizedTransactionData = {Category: "Groceries/Necessities", DescriptionDisplay: "Lidl", Notes: null};
  else if (Description.match(/Aldi \d+ \w+ \w{2}/i)) categorizedTransactionData = {Category: "Groceries/Necessities", DescriptionDisplay: "Aldi", Notes: null};
  else if (Description.match(/Earth Fare \w+ \w+ \w{2}/i)) categorizedTransactionData = {Category: "Groceries/Necessities", DescriptionDisplay: "Earth Fare", Notes: null};
  else if (Description.match(/WholeFds WDF \w+ \w+ \w{2}/i)) categorizedTransactionData = {Category: "Groceries/Necessities", DescriptionDisplay: "Whole Foods Market", Notes: null};
  else if (Description.match(/Trader Joe s #\d+ \w+ \w+ \w{2}/i)) categorizedTransactionData = {Category: "Groceries/Necessities", DescriptionDisplay: "Trader Joe's", Notes: null};
  else if (Description.match(/The Fresh Market \d+ \w+ \w{2}/i)) categorizedTransactionData = {Category: "Groceries/Necessities", DescriptionDisplay: "The Fresh Market", Notes: null};
  else if (Description.match(/Lowes Foods #\d+ \w+ \w{2}/i)) categorizedTransactionData = {Category: "Groceries/Necessities", DescriptionDisplay: "Lowes Foods", Notes: null};
  else if (Description.match(/Ollies Bargain Outlet \w+ \w{2}/i)) categorizedTransactionData = {Category: "Groceries/Necessities", DescriptionDisplay: "Ollie's Bargain Outlet", Notes: null};
  else if (Description.match(/Goodwill - \w+ #\d+ [\w ]+ \w{2}/i)) categorizedTransactionData = {Category: "Groceries/Necessities", DescriptionDisplay: "Goodwill", Notes: null};

  else if (Description.match(/Kohl'?s #\d+ \w+ \w{2}/i)) categorizedTransactionData = {Category: "Groceries/Necessities", DescriptionDisplay: "Kohl's", Notes: null};
  else if (Description.match(/Once Upon A Child \w+ \w{2}/i)) categorizedTransactionData = {Category: "Groceries/Necessities", DescriptionDisplay: "Once Upon A Child", Notes: null};
  else if (Description.match(/Gabriel Bros \d+ \w+ \w{2}/i)) categorizedTransactionData = {Category: "Groceries/Necessities", DescriptionDisplay: "Gabe's", Notes: null};
  else if (Description.match(/Roses Store #\d+ \w+ \w{2}/i)) categorizedTransactionData = {Category: "Groceries/Necessities", DescriptionDisplay: "Roses", Notes: null};
  else if (Description.match(/Dollar ?Tree \w+ \w{2}/i)) categorizedTransactionData = {Category: "Groceries/Necessities", DescriptionDisplay: "Dollar Tree", Notes: null};
  else if (Description.match(/Dollar[- ]General #\d+ [\w ]+ \w{2}/i)) categorizedTransactionData = {Category: "Groceries/Necessities", DescriptionDisplay: "Dollar General", Notes: null};
  else if (Description.match(/Family Dollar #\d+ \w+ \w{2}/i)) categorizedTransactionData = {Category: "Groceries/Necessities", DescriptionDisplay: "Family Dollar", Notes: null};
  else if (Description.match(/Walgreens(?: #\d+ \w+ \w{2}|\.com 877-250-5823 IL)/i)) categorizedTransactionData = {Category: "Groceries/Necessities", DescriptionDisplay: "Walgreens", Notes: null};
  else if (Description.match(/(?:WWW\.CVS\.COM 800-746-7287 RI|CVS PHARMACY #\d+ \w+ \w{2}|CVS CarePass 8\d{2}-?\d{3}-?\d{4} RI)/i))  categorizedTransactionData = {Category: "Groceries/Necessities", DescriptionDisplay: "CVS Pharmacy", Notes: null};
  else if (Description.match(/FIRSTCHOICE PHARMACY L \w+ \w{2}/i))  categorizedTransactionData = {Category: "Groceries/Necessities", DescriptionDisplay: "FirstChoice Pharmacy", Notes: null};
  else if (Description.match(/(?:PP\*)?INSTACART(?:\*\w+)? (?:SAN FRANCISCO ?CA|4029357733 CA)/i))  categorizedTransactionData = {Category: "Groceries/Necessities", DescriptionDisplay: "Instacart", Notes: null};
  else if (Description.match(/SHIPT\* ORDER \w+ AL/i))  categorizedTransactionData = {Category: "Groceries/Necessities", DescriptionDisplay: "Shipt", Notes: null};
  else if (Description.match(/UBER EATS 8005928996 CA/i))  categorizedTransactionData = {Category: "Groceries/Necessities", DescriptionDisplay: "Uber Eats", Notes: null};

  //Eating Out
  else if (Description.match(/McDonald[' ]s (?:S )?\w+ \w+ \w{2}/i))  categorizedTransactionData = {Category: "Eating Out", DescriptionDisplay: "McDonald's", Notes: null};
  else if (Description.match(/Burger King #\d+(?: \w+ \w+ \w{2})?/i))  categorizedTransactionData = {Category: "Eating Out", DescriptionDisplay: "Burger King", Notes: null};
  else if (Description.match(/Sonic Drive[- ]?In #\d+ \w+ \w{2}/i))  categorizedTransactionData = {Category: "Eating Out", DescriptionDisplay: "Sonic Drive-In", Notes: null};
  else if (Description.match(/Cook Out [\w ]+(?: \w+ \w{2})?/i))  categorizedTransactionData = {Category: "Eating Out", DescriptionDisplay: "Cook Out", Notes: null};
  else if (Description.match(/Wendy[' ]?s #\d+ \w+ \w{2}/i))  categorizedTransactionData = {Category: "Eating Out", DescriptionDisplay: "Wendy's", Notes: null};
  else if (Description.match(/Krystal [\d\w]+ \w+ \w{2}/i))  categorizedTransactionData = {Category: "Eating Out", DescriptionDisplay: "Krystal", Notes: null};
  else if (Description.match(/Checkers (?:Drive In|\d+|#\d+ \w+) \w+ \w{2}/i))  categorizedTransactionData = {Category: "Eating Out", DescriptionDisplay: "Checkers", Notes: null};
  else if (Description.match(/Checkers \w+ \w{2}/i))  categorizedTransactionData = {Category: "Eating Out", DescriptionDisplay: "Checkers", Notes: null};
  else if (Description.match(/JACK[' ]S #\d+ \w+ \w+ \w{2}/i))  categorizedTransactionData = {Category: "Eating Out", DescriptionDisplay: "Jack's", Notes: null};
  else if (Description.match(/Jack in the Box \d+ \w+/i))  categorizedTransactionData = {Category: "Eating Out", DescriptionDisplay: "Jack In The Box", Notes: null};
  else if (Description.match(/Wayback Burgers \w+ \w{2}/i))  categorizedTransactionData = {Category: "Eating Out", DescriptionDisplay: "Wayback Burgers", Notes: null};
  else if (Description.match(/Steak N Shake \d+ \w+ \w{2}/i))  categorizedTransactionData = {Category: "Eating Out", DescriptionDisplay: "Steak 'n Shake", Notes: null};
  else if (Description.match(/RED ROBIN NO \d+ \w+ \w{2}/i))  categorizedTransactionData = {Category: "Eating Out", DescriptionDisplay: "Red Robin", Notes: null};
  else if (Description.match(/Culvers [\w ]+ \w+ \w{2}/i))  categorizedTransactionData = {Category: "Eating Out", DescriptionDisplay: "Culver's", Notes: null};
  else if (Description.match(/Arby ?s (?:- )?\d+ \w+ \w{2}/i))  categorizedTransactionData = {Category: "Eating Out", DescriptionDisplay: "Arby's", Notes: null};
  else if (Description.match(/Jersey Mikes? \d+ \w+ \w{2}/i))  categorizedTransactionData = {Category: "Eating Out", DescriptionDisplay: "Jersey Mike's Subs", Notes: null};
  else if (Description.match(/CHICKEN SALAD CHICK - \w+ \w{2}/i))  categorizedTransactionData = {Category: "Eating Out", DescriptionDisplay: "Chicken Salad Chick", Notes: null};
  else if (Description.match(/PDQ  ?(?:\d+( OLO)?|\w+) \w+ \w{2}/i))  categorizedTransactionData = {Category: "Eating Out", DescriptionDisplay: "PDQ", Notes: null};
  else if (Description.match(/Chick-Fil-A #\d+ \w+ \w{2}/i))  categorizedTransactionData = {Category: "Eating Out", DescriptionDisplay: "Chick-fil-A", Notes: null};
  else if (Description.match(/Bojangles \d+ \w+/i))  categorizedTransactionData = {Category: "Eating Out", DescriptionDisplay: "Bojangles", Notes: null};
  else if (Description.match(/KFC \w+ \w+ \w{2}/i))  categorizedTransactionData = {Category: "Eating Out", DescriptionDisplay: "KFC", Notes: null};
  else if (Description.match(/Popeyes (?:\d+|- \w+) \w+ \w{2}/i))  categorizedTransactionData = {Category: "Eating Out", DescriptionDisplay: "Popeyes", Notes: null};
  else if (Description.match(/Zaxby[' ]s #\d+ \w+ \w{2}/i))  categorizedTransactionData = {Category: "Eating Out", DescriptionDisplay: "Zaxby's", Notes: null};
  else if (Description.match(/TST\* Flock Shop - \w+ \w+ \w{2}/i))  categorizedTransactionData = {Category: "Eating Out", DescriptionDisplay: "Flock Shop", Notes: null};
  else if (Description.match(/Taco Bell #?\d+ \w+ \w{2}/i))  categorizedTransactionData = {Category: "Eating Out", DescriptionDisplay: "Taco Bell", Notes: null};
  else if (Description.match(/(?:Chipotle \d+ \w+ \w{2}|Chipotle Online (?:1800\d{6}|9495244000) CA)/i))  categorizedTransactionData = {Category: "Eating Out", DescriptionDisplay: "Chipotle", Notes: null};
  else if (Description.match(/Taco Casa #\d+ \w+ \w{2}/i))  categorizedTransactionData = {Category: "Eating Out", DescriptionDisplay: "Taco Casa", Notes: null};
  else if (Description.match(/TST\* Willy Taco - Hub Spartanburg SC/i))  categorizedTransactionData = {Category: "Eating Out", DescriptionDisplay: "Willy Taco", Notes: null};
  else if (Description.match(/El Tejano Mexican Rest/i))  categorizedTransactionData = {Category: "Eating Out", DescriptionDisplay: "El Tejano", Notes: null};
  else if (Description.match(/La Fogata Mexican Rest Simpsonville Sc/i))  categorizedTransactionData = {Category: "Eating Out", DescriptionDisplay: "La Fogata", Notes: null};
  else if (Description.match(/El Molcajete (?:Mexican )?(R )?Duncan Sc/i))  categorizedTransactionData = {Category: "Eating Out", DescriptionDisplay: "El Molcajete", Notes: null};
  else if (Description.match(/Sr Salsa Greenville SC/i))  categorizedTransactionData = {Category: "Eating Out", DescriptionDisplay: "Sr Salsa Mexican Restaurant", Notes: null};
  else if (Description.match(/Azteca Mexican Restaur Mauldin SC/i))  categorizedTransactionData = {Category: "Eating Out", DescriptionDisplay: "Azteca Mexican Restaurant", Notes: null};
  else if (Description.match(/(?:CKE\*)?Taco Dog (?:Spartanbu )?Spartanburg SC/i))  categorizedTransactionData = {Category: "Eating Out", DescriptionDisplay: "Taco Dog", Notes: null};
  else if (Description.match(/Tropical Grille \w+ \w{2}/i))  categorizedTransactionData = {Category: "Eating Out", DescriptionDisplay: "Tropical Grille", Notes: null};
  else if (Description.match(/Califas \w+ \w{2}/i))  categorizedTransactionData = {Category: "Eating Out", DescriptionDisplay: "Califas", Notes: null};
  else if (Description.match(/Cuchos Taco Grille \w+ \w{2}/i))  categorizedTransactionData = {Category: "Eating Out", DescriptionDisplay: "Cucho's Taco Grille", Notes: null};
  else if (Description.match(/Tipsy Taco \w+ \w{2}/i))  categorizedTransactionData = {Category: "Eating Out", DescriptionDisplay: "Tipsy Taco", Notes: null};
  else if (Description.match(/Viva Villa Mexican Duncan SC/i))  categorizedTransactionData = {Category: "Eating Out", DescriptionDisplay: "Viva Villa Mexican Grill", Notes: null};
  else if (Description.match(/Monterrey Mexican Rest \w+ \w{2}/i))  categorizedTransactionData = {Category: "Eating Out", DescriptionDisplay: "Monterrey Mexican Restaurant", Notes: null};
  else if (Description.match(/Tequila's Mexican \w+ \w{2}/i))  categorizedTransactionData = {Category: "Eating Out", DescriptionDisplay: "Tequlia's Mexican Restaurant", Notes: null};
  else if (Description.match(/Mr Jalapeno- \w+ \w+ \w{2}/i))  categorizedTransactionData = {Category: "Eating Out", DescriptionDisplay: "Mr. Jalapeño", Notes: null};
  else if (Description.match(/Chuy's \w+ \w+ \w{2}/i))  categorizedTransactionData = {Category: "Eating Out", DescriptionDisplay: "Chuy's", Notes: null};
  else if (Description.match(/Taco Casa Inc Tuscaloosa AL/i))  categorizedTransactionData = {Category: "Eating Out", DescriptionDisplay: "Taco Casa", Notes: null};
  else if (Description.match(/Papas and Beer Mexican \w+ \w{2}/i))  categorizedTransactionData = {Category: "Eating Out", DescriptionDisplay: "Papa's & Beer", Notes: null};
  else if (Description.match(/Mi Familia \w+ \w{2}/i))  categorizedTransactionData = {Category: "Eating Out", DescriptionDisplay: "Mi Familia Mexican Restaurant & More", Notes: null};
  else if (Description.match(/IHOP \d+ \w+ \w{2}/i))  categorizedTransactionData = {Category: "Eating Out", DescriptionDisplay: "IHOP", Notes: null};
  else if (Description.match(/Waffle House (?:\d+ )?\w+ \w{2}/i))  categorizedTransactionData = {Category: "Eating Out", DescriptionDisplay: "Waffle House", Notes: null};
  else if (Description.match(/TST\* Eggs Up Grill - \w+ \w+ \w{2}/i))  categorizedTransactionData = {Category: "Eating Out", DescriptionDisplay: "Eggs Up Grill", Notes: null};
  else if (Description.match(/Chili'?s \w+ \w+ \w{2}/i))  categorizedTransactionData = {Category: "Eating Out", DescriptionDisplay: "Chili's", Notes: null};
  else if (Description.match(/Sweet Basil Thai Cusin Greenville SC/i))  categorizedTransactionData = {Category: "Eating Out", DescriptionDisplay: "Sweet Basil Thai Cusine", Notes: null};
  else if (Description.match(/Taste of Thai Spartanburg SC/i))  categorizedTransactionData = {Category: "Eating Out", DescriptionDisplay: "Taste of Thai", Notes: null};
  else if (Description.match(/TST\* Kannika s Thai Ki Greenville SC/i))  categorizedTransactionData = {Category: "Eating Out", DescriptionDisplay: "Kannika's Thai Kitchen", Notes: null};
  else if (Description.match(/Thai Jing Restaurant Greenville SC/i))  categorizedTransactionData = {Category: "Eating Out", DescriptionDisplay: "Thai Jing", Notes: null};
  else if (Description.match(/TeaStar Cafe Spartanburg SC/i))  categorizedTransactionData = {Category: "Eating Out", DescriptionDisplay: "TeaStar Thai Cafe", Notes: null};
  else if (Description.match(/Panda Hibachi Duncan SC/i))  categorizedTransactionData = {Category: "Eating Out", DescriptionDisplay: "Panda Hibachi", Notes: null};
  else if (Description.match(/PF Changs #\d+ \w+ \w{2}/i))  categorizedTransactionData = {Category: "Eating Out", DescriptionDisplay: "PF Changs", Notes: null};
  else if (Description.match(/Lieu[' ]?s (?:Chinese|Asian) Bistro \w+ \w{2}/i))  categorizedTransactionData = {Category: "Eating Out", DescriptionDisplay: "Lieu's Chinese Bistro", Notes: null};
  else if (Description.match(/Ruby Thai \w+ \w+ \w{2}/i))  categorizedTransactionData = {Category: "Eating Out", DescriptionDisplay: "Ruby Thai", Notes: null};
  else if (Description.match(/(Mandarin Express \d+ \w+ \w+ \w{2}|Pei Wei Asian Express \w+ \w{2} USA)/i))  categorizedTransactionData = {Category: "Eating Out", DescriptionDisplay: "Mandarin Express", Notes: null};
  else if (Description.match(/Oriental House \w+ \w{2}/i))  categorizedTransactionData = {Category: "Eating Out", DescriptionDisplay: "Oriental House", Notes: null};
  else if (Description.match(/Hibachi Grill And Buff \w+ \w{2}/i))  categorizedTransactionData = {Category: "Eating Out", DescriptionDisplay: "Hibachi Grill & Buffet", Notes: null};
  else if (Description.match(/HTAB Enterprise LLC Duncan SC/i))  categorizedTransactionData = {Category: "Eating Out", DescriptionDisplay: "Fuji", Notes: null};
  else if (Description.match(/Persis Indian Grill \w+ \w{2}/i))  categorizedTransactionData = {Category: "Eating Out", DescriptionDisplay: "Persis Indian Grill", Notes: null};
  else if (Description.match(/(?:The Olive Gard|Olive Garden )\d{8} \w+ \w{2}/i))  categorizedTransactionData = {Category: "Eating Out", DescriptionDisplay: "Olive Garden", Notes: null};
  else if (Description.match(/Paisanos Italian Resta/i))  categorizedTransactionData = {Category: "Eating Out", DescriptionDisplay: "Paisanos Italian Restaurant", Notes: null};
  else if (Description.match(/Paisanos Italian Greek \w+ \w{2}/i))  categorizedTransactionData = {Category: "Eating Out", DescriptionDisplay: "Paisano's", Notes: null};
  else if (Description.match(/Pizza Hut \d+ \d+ \w{2}/i))  categorizedTransactionData = {Category: "Eating Out", DescriptionDisplay: "Pizza Hut", Notes: null};
  else if (Description.match(/Pizza Inn \w+ \w{2}/i))  categorizedTransactionData = {Category: "Eating Out", DescriptionDisplay: "Pizza Inn", Notes: null};
  else if (Description.match(/Antonio Bertolos Pizza \w+ \w{2}/i))  categorizedTransactionData = {Category: "Eating Out", DescriptionDisplay: "Antonino Bertolo's Pizza", Notes: null};
  else if (Description.match(/Cicis Pizza \w+ \w{2}/i))  categorizedTransactionData = {Category: "Eating Out", DescriptionDisplay: "Cicis Pizza", Notes: null};
  else if (Description.match(/La Taverna Spartanburg SC/i))  categorizedTransactionData = {Category: "Eating Out", DescriptionDisplay: "La Taverna", Notes: null};
  else if (Description.match(/Sbarro \d+ \w+ \w+ \w{2}/i))  categorizedTransactionData = {Category: "Eating Out", DescriptionDisplay: "Sbarro", Notes: null};
  else if (Description.match(/Boston Pizzeria \w+ \w{2}/i))  categorizedTransactionData = {Category: "Eating Out", DescriptionDisplay: "Boston Pizzeria", Notes: null};
  else if (Description.match(/BOVA Pizza \w+ \w{2}/i))  categorizedTransactionData = {Category: "Eating Out", DescriptionDisplay: "BOVA Pizza", Notes: null};
  else if (Description.match(/TST\* Wild Ace Pizza & \w+ \w{2}/i))  categorizedTransactionData = {Category: "Eating Out", DescriptionDisplay: "Wild Ace Pizza & Pub", Notes: null};
  else if (Description.match(/Carrabbas \d+ \w+ \w{2}/i))  categorizedTransactionData = {Category: "Eating Out", DescriptionDisplay: "Carrabba's", Notes: null};
  else if (Description.match(/Little Caesars [\d ]+ \d{3}-\d{3}-\d{4} \w{2}/i))  categorizedTransactionData = {Category: "Eating Out", DescriptionDisplay: "Little Caesars Pizza", Notes: null};
  else if (Description.match(/Milano Pizzeria of Sim \w+ \w{2}/i))  categorizedTransactionData = {Category: "Eating Out", DescriptionDisplay: "Milano Pizzeria & Restaurant", Notes: null};
  else if (Description.match(/Tutti Frutti \w+ \w{2}/i))  categorizedTransactionData = {Category: "Eating Out", DescriptionDisplay: "Tutti Frutti", Notes: null};
  else if (Description.match(/TCBY (?:#\d+ )?\w+ \w{2}/i))  categorizedTransactionData = {Category: "Eating Out", DescriptionDisplay: "TCBY", Notes: null};
  else if (Description.match(/SQ \*Twisted Cup \w+ \w{2}/i))  categorizedTransactionData = {Category: "Eating Out", DescriptionDisplay: "Twisted Cup", Notes: null};
  else if (Description.match(/Hub City Scoops \w+ \w{2}/i))  categorizedTransactionData = {Category: "Eating Out", DescriptionDisplay: "Hub City Scoops", Notes: null};
  else if (Description.match(/Ritas # \d+ \w+ \w{2}/i))  categorizedTransactionData = {Category: "Eating Out", DescriptionDisplay: "Rita's Italian Ice", Notes: null};
  else if (Description.match(/Luna Rosa Gelato Cafe \w+ \w{2}/i))  categorizedTransactionData = {Category: "Eating Out", DescriptionDisplay: "Luna Rosa Gelato Cafe", Notes: null};
  else if (Description.match(/Dairy Queen #\d+ \w+ \w{2}/i))  categorizedTransactionData = {Category: "Eating Out", DescriptionDisplay: "Dairy Queen", Notes: null};
  else if (Description.match(/Yogurt Mountain-\d+ \w+ \w{2}/i))  categorizedTransactionData = {Category: "Eating Out", DescriptionDisplay: "Yogurt Mountain", Notes: null};
  else if (Description.match(/SQ \*\d+ Pelican's Snob \w+ \w{2}/i))  categorizedTransactionData = {Category: "Eating Out", DescriptionDisplay: "Pelican's SnoBalls", Notes: null};
  else if (Description.match(/Krispy Kreme \d+ \w+ \w{2}/i))  categorizedTransactionData = {Category: "Eating Out", DescriptionDisplay: "Krispy Kreme", Notes: null};
  else if (Description.match(/Dunkin #\d+ \w+ \w+ \w{2}/i))  categorizedTransactionData = {Category: "Eating Out", DescriptionDisplay: "Dunkin", Notes: null};
  else if (Description.match(/INSOMNIA COOKIES- \w+ \w+ \w{2}/i))  categorizedTransactionData = {Category: "Eating Out", DescriptionDisplay: "Insomnia Cookies", Notes: null};
  else if (Description.match(/Spill the Beans - \w+ \w+ \w{2}/i))  categorizedTransactionData = {Category: "Eating Out", DescriptionDisplay: "Spill the Beans", Notes: null};
  else if (Description.match(/Starbucks Store \w+ \w+ \w{2}/i))  categorizedTransactionData = {Category: "Eating Out", DescriptionDisplay: "Starbucks", Notes: null};
  else if (Description.match(/PP\*Liquid Highway Greenville SC/i))  categorizedTransactionData = {Category: "Eating Out", DescriptionDisplay: "Liquid Highway", Notes: null};
  else if (Description.match(/Bella Latte Duncan SC/i))  categorizedTransactionData = {Category: "Eating Out", DescriptionDisplay: "Bella Latte", Notes: null};
  else if (Description.match(/(?:SQ \*)?Little River (?:Roast(?:ing)?|Coffe) Spartanburg SC/i))  categorizedTransactionData = {Category: "Eating Out", DescriptionDisplay: "Little River Roasting Co.", Notes: null};
  else if (Description.match(/Coffee Underground Greenville SC/i))  categorizedTransactionData = {Category: "Eating Out", DescriptionDisplay: "Coffee Underground", Notes: null};
  else if (Description.match(/SQ \*Dolce Italy Greenville SC/i))  categorizedTransactionData = {Category: "Eating Out", DescriptionDisplay: "Dolce Italy", Notes: null};
  else if (Description.match(/Subway \d+ \w+ \w{2}/i))  categorizedTransactionData = {Category: "Eating Out", DescriptionDisplay: "Subway", Notes: null};
  else if (Description.match(/Panera Bread #\d+ P \w+ \w{2}/i))  categorizedTransactionData = {Category: "Eating Out", DescriptionDisplay: "Panera Bread", Notes: null};
  else if (Description.match(/Denny[' ]s Inc 18007336 \w+ \w{2}/i))  categorizedTransactionData = {Category: "Eating Out", DescriptionDisplay: "Denny's", Notes: null};
  else if (Description.match(/Applebees \d+ \w+ \w{2}/i))  categorizedTransactionData = {Category: "Eating Out", DescriptionDisplay: "Applebee's", Notes: null};
  else if (Description.match(/Theo s Family Restaurn Greer SC/i))  categorizedTransactionData = {Category: "Eating Out", DescriptionDisplay: "Theo's Family Restaurant", Notes: null};
  else if (Description.match(/Clock of Lyman Restaur Lyman SC/i))  categorizedTransactionData = {Category: "Eating Out", DescriptionDisplay: "Clock Restaurant of Lyman", Notes: null};
  else if (Description.match(/Theos Family Restauran Greer SC/i))  categorizedTransactionData = {Category: "Eating Out", DescriptionDisplay: "Theo's Family Restaurant", Notes: null};
  else if (Description.match(/New S And S Cafe Greenville SC/i))  categorizedTransactionData = {Category: "Eating Out", DescriptionDisplay: "S & S Cafeteria", Notes: null};
  else if (Description.match(/The Blue Ridge Brewing Greenville SC/i))  categorizedTransactionData = {Category: "Eating Out", DescriptionDisplay: "The Blue Ridge Brewing Company", Notes: null};
  else if (Description.match(/Carolina Ale House \w+ \w+ \w{2}/i))  categorizedTransactionData = {Category: "Eating Out", DescriptionDisplay: "Carolina Ale House", Notes: null};
  else if (Description.match(/Flavorshack Hot Chicke Duncan SC/i))  categorizedTransactionData = {Category: "Eating Out", DescriptionDisplay: "Flavorshack Hot Chicken & Ribs", Notes: null};
  else if (Description.match(/Auntie Anne s #\w+ \w+ \w{2}/i))  categorizedTransactionData = {Category: "Eating Out", DescriptionDisplay: "Auntie Anne's", Notes: null};
  else if (Description.match(/River Street Sweets SA \w+ \w{2}/i))  categorizedTransactionData = {Category: "Eating Out", DescriptionDisplay: "River Street Sweets", Notes: null};
  
  //Family Fun
  else if (Description.match(/Shipwreck Cove Duncan SC/i))  categorizedTransactionData = {Category: "Family Fun", DescriptionDisplay: "Shipwreck Cove", Notes: null};
  else if (Description.match(/Fall For Greenville Greenville SC/i))  categorizedTransactionData = {Category: "Family Fun", DescriptionDisplay: "Fall For Greenville", Notes: null};
  else if (Description.match(/SpareTimeGreenville EC 8644120299 SC/i))  categorizedTransactionData = {Category: "Family Fun", DescriptionDisplay: "Spare Time Entertainment", Notes: null};
  else if (Description.match(/NCG SPARTANBURG (?:CINEMA SPARTANBURG SC|OWOSSO MI)/i))  categorizedTransactionData = {Category: "Family Fun", DescriptionDisplay: "NCG Cinema", Notes: null};
  else if (Description.match(/SQ \*SKY TOP ORCHARD ZIRCONIA NC/i))  categorizedTransactionData = {Category: "Family Fun", DescriptionDisplay: "Sky Top Orchard", Notes: null};

  //Church
  else if (Description.match(/Brookwood Church (?:Donat Simpsonville|8646888200) SC/i))  categorizedTransactionData = {Category: "Church", DescriptionDisplay: "Brookwood Church", Notes: "online giving"};

  //Personal Spending

  //Childcare
  else if (Description.match(/GIGGLES DROP IN CHILDC GREENVILLE SC/i))  categorizedTransactionData = {Category: "Childcare", DescriptionDisplay: "Giggles Drop-In Childcare", Notes: null};
  else if (Description.match(/SQ \*KIDSZONE DROP-IN H GREENVILLE SC/i))  categorizedTransactionData = {Category: "Childcare", DescriptionDisplay: "KidsZone Drop-In Childcare", Notes: null};

  //Other
  else if (matches = Description.match(/ELECTRONIC\/ACH CREDIT IRS TREAS 310 ([\w ]+) \d{10}/i))  categorizedTransactionData = {Category: "Miscellaneous", DescriptionDisplay: `Internal Revenue Service ${matches[1]}`, Notes: null};
  else if (matches = Description.match(/ELECTRONIC\/ACH CREDIT SC STATE TREASUR ([\w ]+) \d{10}/i))  categorizedTransactionData = {Category: "Miscellaneous", DescriptionDisplay: `South Carolina Treasury ${matches[1]}`, Notes: null};
  else if (Description.match(/ELECTRONIC\/ACH CREDIT SHFECU SV WEBXFR \w{3} \d{10}/i))  categorizedTransactionData = {Category: "Miscellaneous", DescriptionDisplay: "Sharonview", Notes: null};
  else if (Description.match(/HAMPTON INN \w+ \w+ \w{2}/i))  categorizedTransactionData = {Category: "Miscellaneous", DescriptionDisplay: "Hampton by Hilton", Notes: null};
  else if (Description.match(/HOMES TO SUITES BY HIL \w+ \w{2}/i))  categorizedTransactionData = {Category: "Miscellaneous", DescriptionDisplay: "Homes2 Suites by Hilton", Notes: null};
  else if (Description.match(/Embassy Stes \w+ \w+ \w{2}/i))  categorizedTransactionData = {Category: "Miscellaneous", DescriptionDisplay: "Embassy Suites by Hilton", Notes: null};
  else if (Description.match(/Residence Inn \w+ \w+ \w{2}/i))  categorizedTransactionData = {Category: "Miscellaneous", DescriptionDisplay: "Residence Inn by Marriott", Notes: null};
  else if (Description.match(/(?:THE HOME DEPOT #?\d+ \w+|HOMEDEPOT\.COM 800-430-3376) \w{2}/i))  categorizedTransactionData = {Category: "Miscellaneous", DescriptionDisplay: "The Home Depot", Notes: null};
  else if (Description.match(/ADVANCE AUTO PARTS #\d+ \w+ \w{2}/i))  categorizedTransactionData = {Category: "Miscellaneous", DescriptionDisplay: "Advance Auto Parts", Notes: null};
  else if (Description.match(/HARBOR FREIGHT TOOLS \d \w+ \w{2}/i))  categorizedTransactionData = {Category: "Miscellaneous", DescriptionDisplay: "Harbor Freight", Notes: null};
  else if (Description.match(/CLASSIC ACE HARDWARE \w+ \w{2}/i))  categorizedTransactionData = {Category: "Miscellaneous", DescriptionDisplay: "Classic Ace Hardware", Notes: null};
  else if (Description.match(/(?:AMAZON\.COM|AMZN MKTP US)(?:\*\w+(?: A|\w+))? (?:AMZN\.COM )?AMZN\.COM[\/ ]BILL ?WA/i))  categorizedTransactionData = {Category: "Miscellaneous", DescriptionDisplay: "Amazon", Notes: null};
  else if (Description.match(/DILLARDS \d+ [\w ]+ \w+ \w{2}/i))  categorizedTransactionData = {Category: "Miscellaneous", DescriptionDisplay: "Dillard's", Notes: null};
  else if (Description.match(/BELK #\d+ \w+ \w+ \w{2}/i))  categorizedTransactionData = {Category: "Miscellaneous", DescriptionDisplay: "Belk", Notes: null};
  else if (Description.match(/Hobby Lobby #\d+ \w+ \w{2}/i))  categorizedTransactionData = {Category: "Miscellaneous", DescriptionDisplay: "Hobby Lobby", Notes: null};
  else if (Description.match(/Michaels Stores \d+ \w+ \w{2}/i))  categorizedTransactionData = {Category: "Miscellaneous", DescriptionDisplay: "Michaels", Notes: null};
  else if (Description.match(/Ross Stores? #\d+ \w+ \w{2}/i))  categorizedTransactionData = {Category: "Miscellaneous", DescriptionDisplay: "Ross Stores", Notes: null};
  else if (Description.match(/Burlington Stores \d+ \w+ \w{2}/i))  categorizedTransactionData = {Category: "Miscellaneous", DescriptionDisplay: "Burlington", Notes: null};
  else if (Description.match(/Marshalls #\d+ \w+ \w{2}/i))  categorizedTransactionData = {Category: "Miscellaneous", DescriptionDisplay: "Marshalls", Notes: null};
  else if (Description.match(/Etsy\.com - .+ Brooklyn NY/i))  categorizedTransactionData = {Category: "Miscellaneous", DescriptionDisplay: "Etsy", Notes: null};
  else if (Description.match(/BESTBUYCOM\d{12} 888-?BESTBUY MN/i))  categorizedTransactionData = {Category: "Miscellaneous", DescriptionDisplay: "Best Buy", Notes: null};
  else if (Description.match(/STAPLES \d+ \w+ \w{2}/i))  categorizedTransactionData = {Category: "Miscellaneous", DescriptionDisplay: "Staples", Notes: null};
  else if (Description.match(/BIG LOTS STORES - #\d+ \w+ \w{2}/i))  categorizedTransactionData = {Category: "Miscellaneous", DescriptionDisplay: "Big Lots", Notes: null};
  else if (Description.match(/AT HOME STORE \d+ \w+ \w{2}/i))  categorizedTransactionData = {Category: "Miscellaneous", DescriptionDisplay: "At Home", Notes: null};
  else if (Description.match(/FIVE BELOW \d+ \w+ \w{2}/i))  categorizedTransactionData = {Category: "Miscellaneous", DescriptionDisplay: "Five Below", Notes: null};
  else if (Description.match(/2ND AND CHARLES \d+ \w+ \w{2}/i))  categorizedTransactionData = {Category: "Miscellaneous", DescriptionDisplay: "2nd & Charles", Notes: null};
  else if (Description.match(/K12\*SPARTANBURG5 800-5418999 SC/i))  categorizedTransactionData = {Category: "Miscellaneous", DescriptionDisplay: "District Five Schools of Spartanburg County", Notes: null};
  else if (Description.match(/SPARTANBURGCO TREAS 8645962603 SC/i))  categorizedTransactionData = {Category: "Miscellaneous", DescriptionDisplay: "Spartanburg County Treasury", Notes: null};
  else if (Description.match(/9999 UMG MY CHART PT P 864-4542000 SC/i))  categorizedTransactionData = {Category: "Miscellaneous", DescriptionDisplay: "Prisma Health MyChart", Notes: null};
  else if (Description.match(/Crescent Family Dentis Greer SC/i))  categorizedTransactionData = {Category: "Miscellaneous", DescriptionDisplay: "Crescent Family Dentistry", Notes: null};
  else if (Description.match(/AIRBNB \w+ 4158005959 CA/i))  categorizedTransactionData = {Category: "Miscellaneous", DescriptionDisplay: "Airbnb", Notes: null};
  else if (Description.match(/SQ \*Brown Roof Thrift \w+ \w{2}/i))  categorizedTransactionData = {Category: "Miscellaneous", DescriptionDisplay: "Brown Roof Thrift", Notes: null};
  else if (Description.match(/Switcharoos \w+ \w{2}/i))  categorizedTransactionData = {Category: "Miscellaneous", DescriptionDisplay: "Switch-A-Roos", Notes: null};
  else if (Description.match(/GROUPON INC. 312-288-6424 IL/i))  categorizedTransactionData = {Category: "Miscellaneous", DescriptionDisplay: "Groupon", Notes: null};
  
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
    PostedDate: (transaction.PostedDate ? new Date(transaction.PostedDate).toLocaleDateString("en-US", {timeZone: "UTC"}).toString() : ""),
    TransactionDate: (transaction.TransactionDate ? new Date(transaction.TransactionDate).toLocaleDateString("en-US", {timeZone: "UTC"}).toString() : ""),
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

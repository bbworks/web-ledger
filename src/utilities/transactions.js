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
              Budget: null,
              Notes: null,
              Tags: [],
              Category: null,
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
      const PostedDate = (transaction.PostedDate ? transaction.PostedDate.trim() : (transaction["Posted Date"] ? transaction["Posted Date"] : null));
      const TransactionDate = (transaction.TransactionDate ? transaction.TransactionDate.trim() : (transaction["Transaction Date"] ? transaction["Transaction Date"] : null));
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

      const transactionDateString = nullCoalesce(TransactionDate, _Date);
      const transactionDate = convertDateStringToDate(transactionDateString, (transactionDateString.match(/^\d{2}\/\d{2}\/\d{2}$/) ? "MM/dd/yy" : "MM/dd/yyyy"));
      if (isFalsy(type) || isFalsy(transactionDate)) {
        console.error(transaction);
        throw new Error(`Unable to read transaction.\r\n${Object.entries(transaction).map(([key,value])=>`${key}:${value}`).join(", ")}`);
      }


      return {
        TransactionId: null,
        PostedDate: (PostedDate ? convertDateStringToDate(PostedDate, (PostedDate.match(/^\d{2}\/\d{2}\/\d{2}$/) ? "MM/dd/yy" : "MM/dd/yyyy")) : null),
        TransactionDate: transactionDate,
        AccountNumber: (AccountNumber ? `*${AccountNumber}` : null),
        Type: type,
        Description,
        DescriptionDisplay: null,
        Amount: amount,
        Budget: null,
        Notes: null,
        Tags: [],
        Category: null,
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
  const {DescriptionDisplay, Description, Budget, Notes, Category} = transaction;

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
       if (matches = Description.match(/(?:ELECTRONIC\/ACH CREDIT (.+) PAYROLL \d{10}|PAYROLL (.+) \d+ [\w ]+ ACH CREDIT)/i))  categorizedTransactionData = {Budget: "Infor payroll", DescriptionDisplay: `${matches[1] ?? matches[2]}`, Notes: null /*BudgetCycle: getBudgetCycleFromDate(new Date(TransactionDate.getUTCMonth()+1))*/, Category: null};
  else if (Description.match(/PAYROLL SAMARITAN'S PURS XXXX (.+) ACH CREDIT/i))  categorizedTransactionData = {Budget: "Samaritan's Purse payroll", DescriptionDisplay: "Samaritan's Purse payroll", Notes: null /*BudgetCycle: getBudgetCycleFromDate(new Date(TransactionDate.getUTCMonth()+1))*/, Category: null};
  else if (matches = Description.match(/INTEREST(?: PAYMENT)?(?: INTEREST)?(?: PAID THIS STATEMENT THRU (\d{2})\/(\d{2}))?/i))  categorizedTransactionData = {Budget: "Other income", DescriptionDisplay: `Interest paid${(matches[1] && matches[2] ? ` ${matches[1]}/${matches[2]}` : "")}`, Notes: null /*BudgetCycle: getBudgetCycleFromDate(new Date(TransactionDate.getUTCMonth()+1))*/, Category: null};

  //Charges
  else if (Description.match(/INTEREST CHARGE/i))  categorizedTransactionData = {Budget: "Miscellaneous", DescriptionDisplay: "Interest charge", Notes: null, Category: null};

  //Deposits
  else if (Description.match(/MOBILE CHECK DEPOSIT/i))  categorizedTransactionData = {Budget: "Miscellaneous", DescriptionDisplay: "Mobile check deposit", Notes: null, Category: null};

  //Withdrawals
  else if (Description.match(/ATM CASH WITHDRAWAL/i))  categorizedTransactionData = {Budget: "Miscellaneous", DescriptionDisplay: "ATM withdrawal", Notes: null, Category: null};
  else if (matches = Description.match(/CHECK #(\d+)/i))  categorizedTransactionData = {Budget: "Miscellaneous", DescriptionDisplay: `Check #${matches[1]}`, Notes: null, Category: null};

  //Transfers
  else if (matches = Description.match(/(?:ONLINE (?:BANKING TRANSFER (?:CREDIT )?(?:MOBILE APP TRANSFER )?)?|MOBILE )(TO|FROM) (?:(?:\d{4} )?\d{9}|\*{14}|\*{4})(\d{4})(?: (?:- )?DEPOSIT TRANSFER)?(.+CREDIT CARD PMT)?/i))  categorizedTransactionData = {Budget: "Miscellaneous", DescriptionDisplay: `${matches[3] ? "Payment for CCD" : `Transfer ${matches[1].toLowerCase()}`} *${matches[2]}`, Notes: null, Category: null};
  else if (matches = Description.match(/(?:AUTOMATIC TRANSFER DEBIT \w+ \w+ TRANSFER \d{9}(\d{4})-\d \d{10}|ACCOUNT NUMBER \d{5}(\d{4}) PREAUTHORIZED TRANSFER)/i))  categorizedTransactionData = {Budget: "Miscellaneous", DescriptionDisplay: `Automatic transfer to *${matches[1] ?? matches[2]}`, Notes: null, Category: null};
  else if (matches = Description.match(/(?:ZELLE TRANSFER (TO|FROM) ([\w ]+) \d{2}\/\d{2} ?\w+|([\w ]+) PAYMENT ID BBT\d+ ZELLE PAYMENT (TO|FROM))/i))  categorizedTransactionData = {Budget: "Miscellaneous", DescriptionDisplay: `Zelle transfer ${(matches[1] ?? matches[4]).toLowerCase()} ${toPascalCase((matches[2] ?? matches[3]))}`, Notes: null, Category: null};
  else if (matches = Description.match(/(PAYMENT|CASHOUT) VENMO \d+ (INTERNET PAYMENT|([\w ]+) ACH CREDIT)/i))  categorizedTransactionData = {Budget: "Miscellaneous", DescriptionDisplay: `Venmo ${matches[1].toLowerCase()}${matches[3] ? `from ${toPascalCase(matches[3])}` : ''}`, Notes: null, Category: null};

  //Payments
  else if (matches = Description.match(/(?:MOBILE TO \*{12}(\d{4}) )?CREDIT CARD PAYMENT(?: (?:MOBILE APP PAYMENT|ONLINE BANKING TRANSFER) TO \d{4} \d{6}\*{6}(\d{4}))?/i))  categorizedTransactionData = {Budget: "Miscellaneous", DescriptionDisplay: `Payment for CCD *${matches[1] ?? matches[2]}`, Notes: null, Category: null};
  else if (matches = Description.match(/PAYMENTS? - \w{5} \w{3}(?: \w{7} \w{2})?/i))  categorizedTransactionData = {Budget: "Miscellaneous", DescriptionDisplay: "Credit card payment", Notes: null, Category: null};

  //Bills
  else if (Description.match(/(?:ELECTRONIC\/ACH DEBIT )?PIEDMONT N\. G\.(?: DRAFT \d{13} \d{10})?/i))  categorizedTransactionData = {Budget: "Piedmont Natural Gas", DescriptionDisplay: "Piedmont Natural Gas", Notes: null, Category: null};
  else if (Description.match(/(?:ELECTRONIC\/ACH DEBIT )?(?:BILL PAY )?DUKE ?ENERGY(?:(?: BILL PAY \d{12}| SE WEB PAY \d{14}) \w{10})?/i))  categorizedTransactionData = {Budget: "Duke Energy", DescriptionDisplay: "Duke Energy", Notes: null, Category: null};
  else if (Description.match(/(?:ELECTRONIC\/ACH DEBIT )?(?:RE PAYMENT )?SHARONVIEW FEDER(?: RE PAYMENT \d{10} \d{10})?/i))  categorizedTransactionData = {Budget: "Sharonview mortgage & escrow", DescriptionDisplay: "Sharonview mortgage", Notes: null, Category: null};
  else if (Description.match(/(?:ELECTRONIC\/ACH DEBIT )?SHARONVIEW FCU TRANSFER \d{15} \d{10}/i))  categorizedTransactionData = {Budget: "Sharonview auto loan ", DescriptionDisplay: "Sharonview loan", Notes: null, Category: null};
  else if (Description.match(/(?:ELECTRONIC\/ACH DEBIT )?(?:PURCHASE )?THOMASEHANNAHYMC(?: PURCHASE \d{10})?/i))  categorizedTransactionData = {Budget: "YMCA membership", DescriptionDisplay: "YMCA membership", Notes: null, Category: null};
  else if (Description.match(/(?:ELECTRONIC\/ACH DEBIT )?PLANET FIT CLUB FEES \d{13} \d{10}/i))  categorizedTransactionData = {Budget: "Planet Fitness membership", DescriptionDisplay: "Planet Fitness membership", Notes: null, Category: null};
  else if (Description.match(/(?:(?:ELECTRONIC\/ACH DEBIT )?DEPT EDUCATION STUDENT LN \w{11} \d{10}|STUDENT LN DEPT EDUCATION 0000.+DEBIT)/i))  categorizedTransactionData = {Budget: "Nelnet student loan", DescriptionDisplay: "Nelnet student loan", Notes: null, Category: null};
  else if (Description.match(/(?:(?:ELECTRONIC\/ACH DEBIT )?(?:ESCAVERA HOMEOWN|CEDAR MANAGEMENT) DRAFT \w{6} \d{10})/i))  categorizedTransactionData = {Budget: "HOA dues", DescriptionDisplay: "HOA dues", Notes: null, Category: null};
  else if (Description.match(/Simplisafe 888-957-4675 MA/i))  categorizedTransactionData = {Budget: "SimpliSafe (for mom)", DescriptionDisplay: "SimpliSafe", Notes: null, Category: null};
  else if (Description.match(/[SM]DC\* ?Laurens Electric C Laurens SC/i))  categorizedTransactionData = {Budget: "Laurens Electric ProTec Security", DescriptionDisplay: "Laurens Electric ProTec Security", Notes: null, Category: null};
  else if (Description.match(/SJWD Water District (?:8649492805|8888916064) SC/i))  categorizedTransactionData = {Budget: "SJWD Water District", DescriptionDisplay: "SJWD Water", Notes: null, Category: null};
  else if (Description.match(/State Farm  ?Insurance (?:8009566310|BLOOMINGTON) IL/i))  categorizedTransactionData = {Budget: "State Farm auto insurance", DescriptionDisplay: "State Farm", Notes: null, Category: null};
  else if (Description.match(/Spotify USA(?: New York NY)?/i))  categorizedTransactionData = {Budget: "Spotify Premium subscription", DescriptionDisplay: "Spotify Premium", Notes: null, Category: null};
  else if (Description.match(/Netflix.Com (?:Netflix.Com|Los Gatos) CA/i))  categorizedTransactionData = {Budget: "Netflix Premium subscription", DescriptionDisplay: "Netflix Premium", Notes: null, Category: null};
  else if (Description.match(/(?:Ddv \*)?Discovery(?:plus|\+) ?(?:Ad-Free )?0123456789 TN/i))  categorizedTransactionData = {Budget: "Discovery+ subscription", DescriptionDisplay: "Discovery+ subscription", Notes: null, Category: null};
  else if (Description.match(/Disney ?Plus (?:888-?9057888|Burbank) CA/i))  categorizedTransactionData = {Budget: "Disney+ subscription", DescriptionDisplay: "Disney+ subscription", Notes: null, Category: null};
  else if (Description.match(/Peacock \w+ Premium New York NY/i))  categorizedTransactionData = {Budget: "Peacock Premium subscription", DescriptionDisplay: "Peacock", Notes: null, Category: null};
  else if (Description.match(/Spectrum 855-707-7328 \w{2}/i))  categorizedTransactionData = {Budget: "Spectrum Internet", DescriptionDisplay: "Spectrum Internet", Notes: null, Category: null};
  else if (Description.match(/(?:AT&T \*Payment|ATT\*BILL PAYMENT) 800-288-2020 TX/i))  categorizedTransactionData = {Budget: "AT&T Internet", DescriptionDisplay: "AT&T Internet", Notes: null, Category: null};
  else if (Description.match(/PAYMENT 5\/3 INSTALL LOAN REF \d{11} TELEPHONE PAYMENT/i))  categorizedTransactionData = {Budget: "Fifth Third auto loan", DescriptionDisplay: "Fifth Third auto loan", Notes: null, Category: null};
  else if (Description.match(/KIRBY SANITATION(?:\/C&J E)? (8648778887|GREER) SC/i))  categorizedTransactionData = {Budget: "Kirby Sanitation", DescriptionDisplay: "Kirby Sanitation", Notes: null, Category: null};
  else if (Description.match(/Food for the Hungry (?:480-9983100|PHOENIX) AZ/i))  categorizedTransactionData = {Budget: "Food for the Hungry", DescriptionDisplay: "Food for the Hungry", Notes: null, Category: null};
  else if (Description.match(/SURE PAY MOSAIC [^ ]+ [\w ]+ ACH DEBIT/i))  categorizedTransactionData = {Budget: "Mosaic Financing", DescriptionDisplay: "Mosaic Financing", Notes: null, Category: null};
  else if (Description.match(/GLOBE LIFE AND ACCIDEN 9725406542 OK/i))  categorizedTransactionData = {Budget: "Globe Life insurance", DescriptionDisplay: "Globe Life insurance", Notes: null, Category: null};
  else if (Description.match(/MICROSOFT\*ONEDRIVE STA REDMOND WA/i))  categorizedTransactionData = {Budget: "Microsoft OneDrive subscription", DescriptionDisplay: "Microsoft OneDrive subscription", Notes: null, Category: null};
  else if (Description.match(/COVENANT EYES OWOSSO MI USA/i))  categorizedTransactionData = {Budget: "Covenant Eyes subscription", DescriptionDisplay: "Covenant Eyes subscription", Notes: null, Category: null};

  //Recurring expenses

  //Gas
  else if (Description.match(/QT \d+ (?:INSIDE|OUTSIDE|\w+ \w{2})/i)) categorizedTransactionData = {Budget: "Gas", DescriptionDisplay: "QuikTrip", Notes: null, Category: null};
  else if (Description.match(/CIRCLE K (?:# )?\d+ \w+ \w{2}/i)) categorizedTransactionData = {Budget: "Gas", DescriptionDisplay: "Circle K", Notes: null, Category: null};
  else if (Description.match(/7-ELEVEN \d+ \w+ \w{2}/i)) categorizedTransactionData = {Budget: "Gas", DescriptionDisplay: "7-Eleven", Notes: null, Category: null};
  else if (Description.match(/SPINX #\d+ \w+ \w{2}/i)) categorizedTransactionData = {Budget: "Gas", DescriptionDisplay: "Spinx", Notes: null, Category: null};
  else if (Description.match(/(?:LOVE S TRAVEL |LOVE ?S COUNTRY ?|LOVE'S #)\d+ [\w ]+ \w{2}/i)) categorizedTransactionData = {Budget: "Gas", DescriptionDisplay: "Love's", Notes: null, Category: null};
  else if (Description.match(/SHELL OIL [\d\w]+ [\w ]+ \w{2}/i)) categorizedTransactionData = {Budget: "Gas", DescriptionDisplay: "Shell", Notes: null, Category: null};
  else if (Description.match(/INGLES GAS EXP #\d+ \w+ \w{2}/i)) categorizedTransactionData = {Budget: "Gas", DescriptionDisplay: "Ingles Gas", Notes: null, Category: null};
  else if (Description.match(/RACETRAC ?\d+ \d+ \w+ \w{2}/i)) categorizedTransactionData = {Budget: "Gas", DescriptionDisplay: "RaceTrac", Notes: null, Category: null};
  else if (Description.match(/TA (#\d+ \w+|[\w ]+ #\d+)? \w+ \w{2}/i)) categorizedTransactionData = {Budget: "Gas", DescriptionDisplay: "TA Travel Centers of America", Notes: null, Category: null};
  else if (Description.match(/SPEEDWAY \d+ \d+ \w+ \w+ \w{2}/i)) categorizedTransactionData = {Budget: "Gas", DescriptionDisplay: "Speedway", Notes: null, Category: null};
  else if (Description.match(/BUC-EE[' ]S #\d+ \w+  ?\w{2}/i)) categorizedTransactionData = {Budget: "Gas", DescriptionDisplay: "Buc-ee's", Notes: null, Category: null};
  else if (Description.match(/V GO #\d+ \w+ \w{2}/i)) categorizedTransactionData = {Budget: "Gas", DescriptionDisplay: "V-Go", Notes: null, Category: null};
  else if (Description.match(/TEXACO \d+ \w+ \w{2}/i)) categorizedTransactionData = {Budget: "Gas", DescriptionDisplay: "Texaco", Notes: null, Category: null};
  else if (Description.match(/EXXON(?:MOBIL | SCOTCHMAN #)?(?:\d+| [\w ]+) [\w ]+ \w{2}/i)) categorizedTransactionData = {Budget: "Gas", DescriptionDisplay: "ExxonMobil", Notes: null, Category: null};
  else if (Description.match(/[\w ]+ CITGO \w+ \w{2}/i)) categorizedTransactionData = {Budget: "Gas", DescriptionDisplay: "Citgo", Notes: null, Category: null};
  else if (Description.match(/MARATHON PETRO\d+ \w+ \w{2}/i)) categorizedTransactionData = {Budget: "Gas", DescriptionDisplay: "Marathon", Notes: null, Category: null};
  else if (Description.match(/PILOT \d+ \w+ \w{2}/i)) categorizedTransactionData = {Budget: "Gas", DescriptionDisplay: "Pilot Flying J", Notes: null, Category: null};
  else if (Description.match(/Chevron \d+ \w+ \w{2}/i)) categorizedTransactionData = {Budget: "Gas", DescriptionDisplay: "Chevron", Notes: null, Category: null};
  else if (Description.match(/Red Robin Gas Station \w+ \w{2}/i)) categorizedTransactionData = {Budget: "Gas", DescriptionDisplay: "Red Robin Gas Station", Notes: null, Category: null};
  else if (Description.match(/MAPCO \d+ \w+ \w{2}/i)) categorizedTransactionData = {Budget: "Gas", DescriptionDisplay: "Mapco", Notes: null, Category: null};

  //Groceries & Necessities
  else if (Description.match(/Walmart(?: Grocery|\.com(?: AA)?)  ?(?:(?:\d{3}-?\d{3}-?\d{4}|BENTONVILLE|Walmart\.com) ){1,2}AR/i)) categorizedTransactionData = {Budget: "Groceries/Necessities", DescriptionDisplay: "Walmart Supercenter", Notes: "grocery pickup", Category: null};
  else if (Description.match(/(?:Wal-Mart|WM Supercenter) #\d+ \w+ \w{2}/i)) categorizedTransactionData = {Budget: "Groceries/Necessities", DescriptionDisplay: "Walmart Supercenter", Notes: null, Category: null};
  else if (Description.match(/(?:Target(?: #?\d+ \w+ \w{2}|\.com \* \d{3}-\d{3}-\d{4} MN)|PAYPAL \*TARGETCORPO 4029357733 IN)/i)) categorizedTransactionData = {Budget: "Groceries/Necessities", DescriptionDisplay: "Target", Notes: null, Category: null};
  else if (Description.match(/Ingles Markets #\d+ \w+ \w{2}/i)) categorizedTransactionData = {Budget: "Groceries/Necessities", DescriptionDisplay: "Ingles", Notes: null, Category: null};
  else if (Description.match(/Publix #\d+ \w+ \w{2}/i)) categorizedTransactionData = {Budget: "Groceries/Necessities", DescriptionDisplay: "Publix", Notes: null, Category: null};
  else if (Description.match(/Kroger #\d+ \w+ \w{2}/i)) categorizedTransactionData = {Budget: "Groceries/Necessities", DescriptionDisplay: "Kroger", Notes: null, Category: null};
  else if (Description.match(/Food Lion #\d+ \w+ \w{2}/i)) categorizedTransactionData = {Budget: "Groceries/Necessities", DescriptionDisplay: "Food Lion", Notes: null, Category: null};
  else if (Description.match(/Winn-Dixie   #\d+ \w+ \w{2}/i)) categorizedTransactionData = {Budget: "Groceries/Necessities", DescriptionDisplay: "Winn-Dixie", Notes: null, Category: null};
  else if (Description.match(/(?:Sams ?Club #\d+ \w+ \w{2}|(?:Sams Club #\d+|SAMSCLUB\.COM) \d{3}-\d{3}-\d{4} \w+)/i)) categorizedTransactionData = {Budget: "Groceries/Necessities", DescriptionDisplay: "Sam's Club", Notes: null, Category: null};
  else if (Description.match(/SAMS MEMBERSHIP 888-433-7267 AR/i)) categorizedTransactionData = {Budget: "Miscellaneous", DescriptionDisplay: "Sam's Club club membership", Notes: null, Category: null};
  else if (Description.match(/(WWW COSTCO COM 800-955-2292 WA|COSTCO WHSE #\d+ \d{2}-\d{2}-\d{2} \w+ \w{2} \d+ DEBIT CARD PURCHASE-PIN|COSTCO \*ANNUAL RENEWAL 800-774-2678 WA)/i)) categorizedTransactionData = {Budget: "Groceries/Necessities", DescriptionDisplay: "Costco Wholesale", Notes: null, Category: null};
  else if (Description.match(/Lidl #\d+ \w+ \w{2}/i)) categorizedTransactionData = {Budget: "Groceries/Necessities", DescriptionDisplay: "Lidl", Notes: null, Category: null};
  else if (Description.match(/Aldi \d+ \w+ \w{2}/i)) categorizedTransactionData = {Budget: "Groceries/Necessities", DescriptionDisplay: "Aldi", Notes: null, Category: null};
  else if (Description.match(/Earth Fare \w+ \w+ \w{2}/i)) categorizedTransactionData = {Budget: "Groceries/Necessities", DescriptionDisplay: "Earth Fare", Notes: null, Category: null};
  else if (Description.match(/WholeFds WDF \w+ \w+ \w{2}/i)) categorizedTransactionData = {Budget: "Groceries/Necessities", DescriptionDisplay: "Whole Foods Market", Notes: null, Category: null};
  else if (Description.match(/Trader Joe s #\d+ \w+ \w+ \w{2}/i)) categorizedTransactionData = {Budget: "Groceries/Necessities", DescriptionDisplay: "Trader Joe's", Notes: null, Category: null};
  else if (Description.match(/The Fresh Market \d+ \w+ \w{2}/i)) categorizedTransactionData = {Budget: "Groceries/Necessities", DescriptionDisplay: "The Fresh Market", Notes: null, Category: null};
  else if (Description.match(/Lowes Foods #\d+ \w+ \w{2}/i)) categorizedTransactionData = {Budget: "Groceries/Necessities", DescriptionDisplay: "Lowes Foods", Notes: null, Category: null};
  
  else if (Description.match(/Ollies Bargain Outlet \w+ \w{2}/i)) categorizedTransactionData = {Budget: "Groceries/Necessities", DescriptionDisplay: "Ollie's Bargain Outlet", Notes: null, Category: null};
  else if (Description.match(/Goodwill - \w+ #\d+ [\w ]+ \w{2}/i)) categorizedTransactionData = {Budget: "Groceries/Necessities", DescriptionDisplay: "Goodwill", Notes: null, Category: null};
  else if (Description.match(/Kohl'?s #\d+ \w+ \w{2}/i)) categorizedTransactionData = {Budget: "Groceries/Necessities", DescriptionDisplay: "Kohl's", Notes: null, Category: null};
  else if (Description.match(/Once Upon A Child \w+ \w{2}/i)) categorizedTransactionData = {Budget: "Groceries/Necessities", DescriptionDisplay: "Once Upon A Child", Notes: null, Category: null};
  else if (Description.match(/Gabriel Bros \d+ \w+ \w{2}/i)) categorizedTransactionData = {Budget: "Groceries/Necessities", DescriptionDisplay: "Gabe's", Notes: null, Category: null};
  else if (Description.match(/Roses Store #\d+ \w+ \w{2}/i)) categorizedTransactionData = {Budget: "Groceries/Necessities", DescriptionDisplay: "Roses", Notes: null, Category: null};
  else if (Description.match(/Dollar ?Tree \w+ \w{2}/i)) categorizedTransactionData = {Budget: "Groceries/Necessities", DescriptionDisplay: "Dollar Tree", Notes: null, Category: null};
  else if (Description.match(/Dollar[- ]General #\d+ [\w ]+ \w{2}/i)) categorizedTransactionData = {Budget: "Groceries/Necessities", DescriptionDisplay: "Dollar General", Notes: null, Category: null};
  else if (Description.match(/Family Dollar #\d+ \w+ \w{2}/i)) categorizedTransactionData = {Budget: "Groceries/Necessities", DescriptionDisplay: "Family Dollar", Notes: null, Category: null};
  else if (Description.match(/Walgreens(?: #\d+ \w+ \w{2}|\.com 877-250-5823 IL)/i)) categorizedTransactionData = {Budget: "Groceries/Necessities", DescriptionDisplay: "Walgreens", Notes: null, Category: null};
  else if (Description.match(/FIRSTCHOICE PHARMACY L \w+ \w{2}/i))  categorizedTransactionData = {Budget: "Groceries/Necessities", DescriptionDisplay: "FirstChoice Pharmacy", Notes: null, Category: null};
  
  else if (Description.match(/(?:(?:WWW\.CVS\.COM|CVSExtraCare 800746728) 800-746-?7287 RI|CVS[ \/]PHARMACY #\d+ \w+ \w{2}|CVS CarePass 8\d{2}-?\d{3}-?\d{4} RI)/i))  categorizedTransactionData = {Budget: "Groceries/Necessities", DescriptionDisplay: "CVS Pharmacy", Notes: null, Category: null};

  else if (Description.match(/(?:PP\*)?INSTACART(?:\*\w+)? (?:SAN FRANCISCO ?CA|4029357733 CA)/i))  categorizedTransactionData = {Budget: "Groceries/Necessities", DescriptionDisplay: "Instacart", Notes: null, Category: null};
  else if (Description.match(/SHIPT\* ORDER \w+ AL/i))  categorizedTransactionData = {Budget: "Groceries/Necessities", DescriptionDisplay: "Shipt", Notes: null, Category: null};
  else if (Description.match(/UBER EATS 8005928996 CA/i))  categorizedTransactionData = {Budget: "Groceries/Necessities", DescriptionDisplay: "Uber Eats", Notes: null, Category: null};

  //Eating Out
  else if (Description.match(/McDonald[' ]s (?:S )?\w+ \w+ \w{2}/i))  categorizedTransactionData = {Budget: "Eating Out", DescriptionDisplay: "McDonald's", Notes: null, Category: null};
  else if (Description.match(/Burger King #\d+(?: \w+ \w+ \w{2})?/i))  categorizedTransactionData = {Budget: "Eating Out", DescriptionDisplay: "Burger King", Notes: null, Category: null};
  else if (Description.match(/Sonic Drive[- ]?In #\d+ \w+ \w{2}/i))  categorizedTransactionData = {Budget: "Eating Out", DescriptionDisplay: "Sonic Drive-In", Notes: null, Category: null};
  else if (Description.match(/Cook Out [\w ]+(?: \w+ \w{2})?/i))  categorizedTransactionData = {Budget: "Eating Out", DescriptionDisplay: "Cook Out", Notes: null, Category: null};
  else if (Description.match(/Wendy[' ]?s #?\d+ \w+ \w{2}/i))  categorizedTransactionData = {Budget: "Eating Out", DescriptionDisplay: "Wendy's", Notes: null, Category: null};
  else if (Description.match(/Hardees \w+ \w{2}/i))  categorizedTransactionData = {Budget: "Eating Out", DescriptionDisplay: "Hardees", Notes: null, Category: null};
  else if (Description.match(/WhiteCastle \d+ \w+ \w{2}/i))  categorizedTransactionData = {Budget: "Eating Out", DescriptionDisplay: "White Castle", Notes: null, Category: null};
  else if (Description.match(/Krystal [\d\w]+ \w+ \w{2}/i))  categorizedTransactionData = {Budget: "Eating Out", DescriptionDisplay: "Krystal", Notes: null, Category: null};
  else if (Description.match(/Checkers (?:Drive In|\d+|#\d+ \w+) \w+ \w{2}/i))  categorizedTransactionData = {Budget: "Eating Out", DescriptionDisplay: "Checkers", Notes: null, Category: null};
  else if (Description.match(/Checkers \w+ \w{2}/i))  categorizedTransactionData = {Budget: "Eating Out", DescriptionDisplay: "Checkers", Notes: null, Category: null};
  else if (Description.match(/JACK[' ]S #\d+ \w+ \w+ \w{2}/i))  categorizedTransactionData = {Budget: "Eating Out", DescriptionDisplay: "Jack's", Notes: null, Category: null};
  else if (Description.match(/Jack in the Box \d+ \w+/i))  categorizedTransactionData = {Budget: "Eating Out", DescriptionDisplay: "Jack In The Box", Notes: null, Category: null};
  else if (Description.match(/Wayback Burgers \w+ \w{2}/i))  categorizedTransactionData = {Budget: "Eating Out", DescriptionDisplay: "Wayback Burgers", Notes: null, Category: null};
  else if (Description.match(/Steak N Shake \d+ \w+ \w{2}/i))  categorizedTransactionData = {Budget: "Eating Out", DescriptionDisplay: "Steak 'n Shake", Notes: null, Category: null};
  else if (Description.match(/RED ROBIN NO \d+ \w+ \w{2}/i))  categorizedTransactionData = {Budget: "Eating Out", DescriptionDisplay: "Red Robin", Notes: null, Category: null};
  else if (Description.match(/Culvers [\w ]+ \w+ \w{2}/i))  categorizedTransactionData = {Budget: "Eating Out", DescriptionDisplay: "Culver's", Notes: null, Category: null};
  else if (Description.match(/Whataburger \d+ \w+ \w{2}/i))  categorizedTransactionData = {Budget: "Eating Out", DescriptionDisplay: "Whataburger", Notes: null, Category: null};
  else if (Description.match(/Arby ?s (?:- )?\d+ \w+ \w{2}/i))  categorizedTransactionData = {Budget: "Eating Out", DescriptionDisplay: "Arby's", Notes: null, Category: null};
  else if (Description.match(/Jersey Mikes? \d+ \w+ \w{2}/i))  categorizedTransactionData = {Budget: "Eating Out", DescriptionDisplay: "Jersey Mike's Subs", Notes: null, Category: null};
  else if (Description.match(/CHICKEN SALAD CHICK (?:-|00) \w+ \w{2}/i))  categorizedTransactionData = {Budget: "Eating Out", DescriptionDisplay: "Chicken Salad Chick", Notes: null, Category: null};
  else if (Description.match(/PDQ  ?(?:\d+( OLO)?|\w+) \w+ \w{2}/i))  categorizedTransactionData = {Budget: "Eating Out", DescriptionDisplay: "PDQ", Notes: null, Category: null};
  else if (Description.match(/Chick-Fil-A #\d+ \w+ \w{2}/i))  categorizedTransactionData = {Budget: "Eating Out", DescriptionDisplay: "Chick-fil-A", Notes: null, Category: null};
  else if (Description.match(/Bojangles'? (?:\d+|[\w ]+) \w+ \w{2}/i))  categorizedTransactionData = {Budget: "Eating Out", DescriptionDisplay: "Bojangles", Notes: null, Category: null};
  else if (Description.match(/KFC \w+ \w+ \w{2}/i))  categorizedTransactionData = {Budget: "Eating Out", DescriptionDisplay: "KFC", Notes: null, Category: null};
  else if (Description.match(/Popeyes (?:\d+|- \w+) \w+ \w{2}/i))  categorizedTransactionData = {Budget: "Eating Out", DescriptionDisplay: "Popeyes", Notes: null, Category: null};
  else if (Description.match(/Zaxby[' ]s #\d+ \w+ \w{2}/i))  categorizedTransactionData = {Budget: "Eating Out", DescriptionDisplay: "Zaxby's", Notes: null, Category: null};
  else if (Description.match(/TST\* Flock Shop - \w+ \w+ \w{2}/i))  categorizedTransactionData = {Budget: "Eating Out", DescriptionDisplay: "Flock Shop", Notes: null, Category: null};
  else if (Description.match(/Taco Bell #?\d+ \w+ \w{2}/i))  categorizedTransactionData = {Budget: "Eating Out", DescriptionDisplay: "Taco Bell", Notes: null, Category: null};
  else if (Description.match(/(?:Chipotle \d+ \w+ \w{2}|Chipotle Online (?:1800\d{6}|9495244000) CA)/i))  categorizedTransactionData = {Budget: "Eating Out", DescriptionDisplay: "Chipotle", Notes: null, Category: null};
  else if (Description.match(/Taco Casa #\d+ \w+ \w{2}/i))  categorizedTransactionData = {Budget: "Eating Out", DescriptionDisplay: "Taco Casa", Notes: null, Category: null};
  else if (Description.match(/TST\* Willy Taco - Hub Spartanburg SC/i))  categorizedTransactionData = {Budget: "Eating Out", DescriptionDisplay: "Willy Taco", Notes: null, Category: null};
  else if (Description.match(/El Tejano Mexican Rest/i))  categorizedTransactionData = {Budget: "Eating Out", DescriptionDisplay: "El Tejano", Notes: null, Category: null};
  else if (Description.match(/La Fogata Mexican Rest Simpsonville Sc/i))  categorizedTransactionData = {Budget: "Eating Out", DescriptionDisplay: "La Fogata", Notes: null, Category: null};
  else if (Description.match(/El Molcajete (?:Mexican )?(R )?Duncan Sc/i))  categorizedTransactionData = {Budget: "Eating Out", DescriptionDisplay: "El Molcajete", Notes: null, Category: null};
  else if (Description.match(/Sr Salsa Greenville SC/i))  categorizedTransactionData = {Budget: "Eating Out", DescriptionDisplay: "Sr Salsa Mexican Restaurant", Notes: null, Category: null};
  else if (Description.match(/Azteca Mexican Restaur Mauldin SC/i))  categorizedTransactionData = {Budget: "Eating Out", DescriptionDisplay: "Azteca Mexican Restaurant", Notes: null, Category: null};
  else if (Description.match(/(?:CKE\*)?Taco Dog (?:Spartanbu )?Spartanburg SC/i))  categorizedTransactionData = {Budget: "Eating Out", DescriptionDisplay: "Taco Dog", Notes: null, Category: null};
  else if (Description.match(/Tropical Grille \w+ \w{2}/i))  categorizedTransactionData = {Budget: "Eating Out", DescriptionDisplay: "Tropical Grille", Notes: null, Category: null};
  else if (Description.match(/Califas \w+ \w{2}/i))  categorizedTransactionData = {Budget: "Eating Out", DescriptionDisplay: "Califas", Notes: null, Category: null};
  else if (Description.match(/Cuchos Taco Grille \w+ \w{2}/i))  categorizedTransactionData = {Budget: "Eating Out", DescriptionDisplay: "Cucho's Taco Grille", Notes: null, Category: null};
  else if (Description.match(/Tipsy Taco \w+ \w{2}/i))  categorizedTransactionData = {Budget: "Eating Out", DescriptionDisplay: "Tipsy Taco", Notes: null, Category: null};
  else if (Description.match(/Viva Villa Mexican Duncan SC/i))  categorizedTransactionData = {Budget: "Eating Out", DescriptionDisplay: "Viva Villa Mexican Grill", Notes: null, Category: null};
  else if (Description.match(/Monterrey Mexican Rest \w+ \w{2}/i))  categorizedTransactionData = {Budget: "Eating Out", DescriptionDisplay: "Monterrey Mexican Restaurant", Notes: null, Category: null};
  else if (Description.match(/Tequila's Mexican \w+ \w{2}/i))  categorizedTransactionData = {Budget: "Eating Out", DescriptionDisplay: "Tequlia's Mexican Restaurant", Notes: null, Category: null};
  else if (Description.match(/Mr Jalapeno- \w+ \w+ \w{2}/i))  categorizedTransactionData = {Budget: "Eating Out", DescriptionDisplay: "Mr. Jalapeño", Notes: null, Category: null};
  else if (Description.match(/Chuy's \w+ \w+ \w{2}/i))  categorizedTransactionData = {Budget: "Eating Out", DescriptionDisplay: "Chuy's", Notes: null, Category: null};
  else if (Description.match(/Taco Casa Inc Tuscaloosa AL/i))  categorizedTransactionData = {Budget: "Eating Out", DescriptionDisplay: "Taco Casa", Notes: null, Category: null};
  else if (Description.match(/Papas and Beer \w+ \w+ \w{2}/i))  categorizedTransactionData = {Budget: "Eating Out", DescriptionDisplay: "Papa's & Beer", Notes: null, Category: null};
  else if (Description.match(/Mi Familia \w+ \w{2}/i))  categorizedTransactionData = {Budget: "Eating Out", DescriptionDisplay: "Mi Familia Mexican Restaurant & More", Notes: null, Category: null};
  else if (Description.match(/Taqueria Picante \w{2}/i))  categorizedTransactionData = {Budget: "Eating Out", DescriptionDisplay: "Taqueria Picante Mexican Kitchen & Grill", Notes: null, Category: null};
  else if (Description.match(/El Carriel LLC \w+ \w{2}/i))  categorizedTransactionData = {Budget: "Eating Out", DescriptionDisplay: "El Carriel", Notes: null, Category: null};
  else if (Description.match(/PAR\*SALSARITA'S FRESH \w+ \w{2}/i))  categorizedTransactionData = {Budget: "Eating Out", DescriptionDisplay: "Salsarita's Fresh Mexican Grill", Notes: null, Category: null};
  else if (Description.match(/Uncle Berto's Burritos \w+ \w{2}/i))  categorizedTransactionData = {Budget: "Eating Out", DescriptionDisplay: "Uncle Berto's Burritos", Notes: null, Category: null};
  else if (Description.match(/IHOP #?\d+ \w+ \w{2}/i))  categorizedTransactionData = {Budget: "Eating Out", DescriptionDisplay: "IHOP", Notes: null, Category: null};
  else if (Description.match(/Waffle House (?:\d+ )?\w+ \w{2}/i))  categorizedTransactionData = {Budget: "Eating Out", DescriptionDisplay: "Waffle House", Notes: null, Category: null};
  else if (Description.match(/TST\* Eggs Up Grill - \w+ \w+ \w{2}/i))  categorizedTransactionData = {Budget: "Eating Out", DescriptionDisplay: "Eggs Up Grill", Notes: null, Category: null};
  else if (Description.match(/Cracker Barrel #\d+ \w+ \w+ \w{2}/i))  categorizedTransactionData = {Budget: "Eating Out", DescriptionDisplay: "Cracker Barrel", Notes: null, Category: null};
  else if (Description.match(/Biscuitville \d+ \w+ \w{2}/i))  categorizedTransactionData = {Budget: "Eating Out", DescriptionDisplay: "Biscuitville", Notes: null, Category: null};
  else if (Description.match(/Chili'?s \w+ \w+ \w{2}/i))  categorizedTransactionData = {Budget: "Eating Out", DescriptionDisplay: "Chili's", Notes: null, Category: null};
  else if (Description.match(/Sweet Basil Thai Cusin Greenville SC/i))  categorizedTransactionData = {Budget: "Eating Out", DescriptionDisplay: "Sweet Basil Thai Cusine", Notes: null, Category: null};
  else if (Description.match(/Taste of Thai Spartanburg SC/i))  categorizedTransactionData = {Budget: "Eating Out", DescriptionDisplay: "Taste of Thai", Notes: null, Category: null};
  else if (Description.match(/TST\* Kannika s Thai Ki Greenville SC/i))  categorizedTransactionData = {Budget: "Eating Out", DescriptionDisplay: "Kannika's Thai Kitchen", Notes: null, Category: null};
  else if (Description.match(/Thai Jing Restaurant Greenville SC/i))  categorizedTransactionData = {Budget: "Eating Out", DescriptionDisplay: "Thai Jing", Notes: null, Category: null};
  else if (Description.match(/Thai Y'All Boiling Sprin SC/i))  categorizedTransactionData = {Budget: "Eating Out", DescriptionDisplay: "Thai Y'all", Notes: null, Category: null};
  else if (Description.match(/Bangkok 2 \w+ \w{2}/i))  categorizedTransactionData = {Budget: "Eating Out", DescriptionDisplay: "Bangkok on 9", Notes: null, Category: null};
  else if (Description.match(/TeaStar Cafe Spartanburg SC/i))  categorizedTransactionData = {Budget: "Eating Out", DescriptionDisplay: "TeaStar Thai Cafe", Notes: null, Category: null};
  else if (Description.match(/Panda Hibachi Duncan SC/i))  categorizedTransactionData = {Budget: "Eating Out", DescriptionDisplay: "Panda Hibachi", Notes: null, Category: null};
  else if (Description.match(/PF Changs #\d+ \w+ \w{2}/i))  categorizedTransactionData = {Budget: "Eating Out", DescriptionDisplay: "PF Changs", Notes: null, Category: null};
  else if (Description.match(/Lieu[' ]?s (?:Chinese|Asian) Bistro \w+ \w{2}/i))  categorizedTransactionData = {Budget: "Eating Out", DescriptionDisplay: "Lieu's Chinese Bistro", Notes: null, Category: null};
  else if (Description.match(/Ruby Thai \w+ \w+ \w{2}/i))  categorizedTransactionData = {Budget: "Eating Out", DescriptionDisplay: "Ruby Thai", Notes: null, Category: null};
  else if (Description.match(/(Mandarin Express \d+ \w+ \w+ \w{2}|Pei Wei Asian Express \w+ \w{2} USA)/i))  categorizedTransactionData = {Budget: "Eating Out", DescriptionDisplay: "Mandarin Express", Notes: null, Category: null};
  else if (Description.match(/SQ \*The Orient on Main \w+ \w{2}/i))  categorizedTransactionData = {Budget: "Eating Out", DescriptionDisplay: "The Orient", Notes: null, Category: null};
  else if (Description.match(/Oriental House \w+ \w{2}/i))  categorizedTransactionData = {Budget: "Eating Out", DescriptionDisplay: "Oriental House", Notes: null, Category: null};
  else if (Description.match(/Hibachi Grill And Buff \w+ \w{2}/i))  categorizedTransactionData = {Budget: "Eating Out", DescriptionDisplay: "Hibachi Grill & Buffet", Notes: null, Category: null};
  else if (Description.match(/NY Hibachi & Sushi Buf \w+ \w{2}/i))  categorizedTransactionData = {Budget: "Eating Out", DescriptionDisplay: "NY Hibachi & Sushi Buffet", Notes: null, Category: null};
  else if (Description.match(/(?:Fuji \w+|HTAB Enterprise LLC) Duncan SC/i))  categorizedTransactionData = {Budget: "Eating Out", DescriptionDisplay: "Fuji", Notes: null, Category: null};
  else if (Description.match(/Jade Express Spartanburg SC/i))  categorizedTransactionData = {Budget: "Eating Out", DescriptionDisplay: "Jade Express", Notes: null, Category: null};
  else if (Description.match(/Persis Indian Grill \w+ \w{2}/i))  categorizedTransactionData = {Budget: "Eating Out", DescriptionDisplay: "Persis Indian Grill", Notes: null, Category: null};
  else if (Description.match(/Saffron Indian Cuisine \w+ \w{2}/i))  categorizedTransactionData = {Budget: "Eating Out", DescriptionDisplay: "Saffron Indian Cuisine", Notes: null, Category: null};
  else if (Description.match(/Tandoor Express \w+ \w{2}/i))  categorizedTransactionData = {Budget: "Eating Out", DescriptionDisplay: "Tandoor Express Indian Grill", Notes: null, Category: null};
  else if (Description.match(/(?:The Olive Gard|Olive Garden ).+ \w+ \w{2}/i))  categorizedTransactionData = {Budget: "Eating Out", DescriptionDisplay: "Olive Garden", Notes: null, Category: null};
  else if (Description.match(/Paisanos Italian Resta/i))  categorizedTransactionData = {Budget: "Eating Out", DescriptionDisplay: "Paisanos Italian Restaurant", Notes: null, Category: null};
  else if (Description.match(/Paisanos Italian Greek \w+ \w{2}/i))  categorizedTransactionData = {Budget: "Eating Out", DescriptionDisplay: "Paisano's", Notes: null, Category: null};
  else if (Description.match(/Pizza Hut \d+ \w+ \w{2}/i))  categorizedTransactionData = {Budget: "Eating Out", DescriptionDisplay: "Pizza Hut", Notes: null, Category: null};
  else if (Description.match(/Pizza Inn \w+ \w{2}/i))  categorizedTransactionData = {Budget: "Eating Out", DescriptionDisplay: "Pizza Inn", Notes: null, Category: null};
  else if (Description.match(/Antonio Bertolos Pizza \w+ \w{2}/i))  categorizedTransactionData = {Budget: "Eating Out", DescriptionDisplay: "Antonino Bertolo's Pizza", Notes: null, Category: null};
  else if (Description.match(/Cicis Pizza \w+ \w{2}/i))  categorizedTransactionData = {Budget: "Eating Out", DescriptionDisplay: "Cicis Pizza", Notes: null, Category: null};
  else if (Description.match(/La Taverna Spartanburg SC/i))  categorizedTransactionData = {Budget: "Eating Out", DescriptionDisplay: "La Taverna", Notes: null, Category: null};
  else if (Description.match(/Sbarro \d+ \w+ \w+ \w{2}/i))  categorizedTransactionData = {Budget: "Eating Out", DescriptionDisplay: "Sbarro", Notes: null, Category: null};
  else if (Description.match(/Boston Pizzeria \w+ \w{2}/i))  categorizedTransactionData = {Budget: "Eating Out", DescriptionDisplay: "Boston Pizzeria", Notes: null, Category: null};
  else if (Description.match(/BOVA Pizza \w+ \w{2}/i))  categorizedTransactionData = {Budget: "Eating Out", DescriptionDisplay: "BOVA Pizza", Notes: null, Category: null};
  else if (Description.match(/TST\* Wild Ace Pizza & \w+ \w{2}/i))  categorizedTransactionData = {Budget: "Eating Out", DescriptionDisplay: "Wild Ace Pizza & Pub", Notes: null, Category: null};
  else if (Description.match(/Carrabbas \d+ \w+ \w{2}/i))  categorizedTransactionData = {Budget: "Eating Out", DescriptionDisplay: "Carrabba's", Notes: null, Category: null};
  else if (Description.match(/Little Caesars [\d ]+ (?:\d{3}-\d{3}-\d{4}|\w+) \w{2}/i))  categorizedTransactionData = {Budget: "Eating Out", DescriptionDisplay: "Little Caesars Pizza", Notes: null, Category: null};
  else if (Description.match(/Milano Pizzeria of Sim \w+ \w{2}/i))  categorizedTransactionData = {Budget: "Eating Out", DescriptionDisplay: "Milano Pizzeria & Restaurant", Notes: null, Category: null};
  else if (Description.match(/Acropolis Restaurant & \w+ \w{2}/i))  categorizedTransactionData = {Budget: "Eating Out", DescriptionDisplay: "Acropolis Restaurant and Oasis Bar", Notes: null, Category: null};
  else if (Description.match(/Limoncello Greenville SC/i))  categorizedTransactionData = {Budget: "Eating Out", DescriptionDisplay: "Limoncello", Notes: null, Category: null};
  else if (Description.match(/COLDSTONE #\d+ \w+ \w{2}/i))  categorizedTransactionData = {Budget: "Eating Out", DescriptionDisplay: "Cold Stone Creamery", Notes: null, Category: null};
  else if (Description.match(/Tutti Frutti \w+ \w{2}/i))  categorizedTransactionData = {Budget: "Eating Out", DescriptionDisplay: "Tutti Frutti", Notes: null, Category: null};
  else if (Description.match(/TCBY (?:#\d+ )?\w+ \w{2}/i))  categorizedTransactionData = {Budget: "Eating Out", DescriptionDisplay: "TCBY", Notes: null, Category: null};
  else if (Description.match(/SQ \*Twisted Cup \w+ \w{2}/i))  categorizedTransactionData = {Budget: "Eating Out", DescriptionDisplay: "Twisted Cup", Notes: null, Category: null};
  else if (Description.match(/Hub City Scoops \w+ \w{2}/i))  categorizedTransactionData = {Budget: "Eating Out", DescriptionDisplay: "Hub City Scoops", Notes: null, Category: null};
  else if (Description.match(/Ritas # \d+ \w+ \w{2}/i))  categorizedTransactionData = {Budget: "Eating Out", DescriptionDisplay: "Rita's Italian Ice", Notes: null, Category: null};
  else if (Description.match(/Luna Rosa Gelato Cafe \w+ \w{2}/i))  categorizedTransactionData = {Budget: "Eating Out", DescriptionDisplay: "Luna Rosa Gelato Cafe", Notes: null, Category: null};
  else if (Description.match(/Dairy Queen #\d+ \w+ \w{2}/i))  categorizedTransactionData = {Budget: "Eating Out", DescriptionDisplay: "Dairy Queen", Notes: null, Category: null};
  else if (Description.match(/Yogurt Mountain-\d+ \w+ \w{2}/i))  categorizedTransactionData = {Budget: "Eating Out", DescriptionDisplay: "Yogurt Mountain", Notes: null, Category: null};
  else if (Description.match(/SQ \*\d+ Pelican's Snob \w+ \w{2}/i))  categorizedTransactionData = {Budget: "Eating Out", DescriptionDisplay: "Pelican's SnoBalls", Notes: null, Category: null};
  else if (Description.match(/SQ \*Kona Ice [\w ]+ \w+ \w{2}/i))  categorizedTransactionData = {Budget: "Eating Out", DescriptionDisplay: "Kona Ice Truck", Notes: null, Category: null};
  else if (Description.match(/TST\* Yogi's Cups and C \w+ \w{2}/i))  categorizedTransactionData = {Budget: "Eating Out", DescriptionDisplay: "Yogi's Cups & Cones", Notes: null, Category: null};
  else if (Description.match(/Andy's Frozen Custard \w+ \w{2}/i))  categorizedTransactionData = {Budget: "Eating Out", DescriptionDisplay: "Andy's Frozen Custard", Notes: null, Category: null};
  else if (Description.match(/Krispy Kreme #?\d+ [\w ]+ \w{2}/i))  categorizedTransactionData = {Budget: "Eating Out", DescriptionDisplay: "Krispy Kreme", Notes: null, Category: null};
  else if (Description.match(/Dunkin #\d+ \w+ \w+ \w{2}/i))  categorizedTransactionData = {Budget: "Eating Out", DescriptionDisplay: "Dunkin", Notes: null, Category: null};
  else if (Description.match(/INSOMNIA COOKIES- \w+ \w+ \w{2}/i))  categorizedTransactionData = {Budget: "Eating Out", DescriptionDisplay: "Insomnia Cookies", Notes: null, Category: null};
  else if (Description.match(/Spill the Beans - \w+ \w+ \w{2}/i))  categorizedTransactionData = {Budget: "Eating Out", DescriptionDisplay: "Spill the Beans", Notes: null, Category: null};
  else if (Description.match(/Starbucks Store \w+ \w+ \w{2}/i))  categorizedTransactionData = {Budget: "Eating Out", DescriptionDisplay: "Starbucks", Notes: null, Category: null};
  else if (Description.match(/PP\*Liquid Highway Greenville SC/i))  categorizedTransactionData = {Budget: "Eating Out", DescriptionDisplay: "Liquid Highway", Notes: null, Category: null};
  else if (Description.match(/Bella Latte Duncan SC/i))  categorizedTransactionData = {Budget: "Eating Out", DescriptionDisplay: "Bella Latte", Notes: null, Category: null};
  else if (Description.match(/(?:SQ \*)?Little River (?:Roast(?:ing)?|Coffe) Spartanburg SC/i))  categorizedTransactionData = {Budget: "Eating Out", DescriptionDisplay: "Little River Roasting Co.", Notes: null, Category: null};
  else if (Description.match(/Coffee Underground Greenville SC/i))  categorizedTransactionData = {Budget: "Eating Out", DescriptionDisplay: "Coffee Underground", Notes: null, Category: null};
  else if (Description.match(/Scooter's Coffee #1954 Duncan SC/i))  categorizedTransactionData = {Budget: "Eating Out", DescriptionDisplay: "Scooter's Coffee", Notes: null, Category: null};
  else if (Description.match(/SQ \*Dolce Italy Greenville SC/i))  categorizedTransactionData = {Budget: "Eating Out", DescriptionDisplay: "Dolce Italy", Notes: null, Category: null};
  else if (Description.match(/Subway \d+ \w+ \w{2}/i))  categorizedTransactionData = {Budget: "Eating Out", DescriptionDisplay: "Subway", Notes: null, Category: null};
  else if (Description.match(/Panera Bread #\d+ P \w+ \w{2}/i))  categorizedTransactionData = {Budget: "Eating Out", DescriptionDisplay: "Panera Bread", Notes: null, Category: null};
  else if (Description.match(/Denny[' ]s Inc 18007336 \w+ \w{2}/i))  categorizedTransactionData = {Budget: "Eating Out", DescriptionDisplay: "Denny's", Notes: null, Category: null};
  else if (Description.match(/PAR\*Sticky Fingers Rib \w+ \w{2}/i))  categorizedTransactionData = {Budget: "Eating Out", DescriptionDisplay: "Sticky Fingers Rib House", Notes: null, Category: null};
  else if (Description.match(/Applebees \d+ \w+ \w{2}/i))  categorizedTransactionData = {Budget: "Eating Out", DescriptionDisplay: "Applebee's", Notes: null, Category: null};
  else if (Description.match(/Theo s Family Restaurn Greer SC/i))  categorizedTransactionData = {Budget: "Eating Out", DescriptionDisplay: "Theo's Family Restaurant", Notes: null, Category: null};
  else if (Description.match(/Clock of Lyman Restaur Lyman SC/i))  categorizedTransactionData = {Budget: "Eating Out", DescriptionDisplay: "Clock Restaurant of Lyman", Notes: null, Category: null};
  else if (Description.match(/Theos Family Restauran Greer SC/i))  categorizedTransactionData = {Budget: "Eating Out", DescriptionDisplay: "Theo's Family Restaurant", Notes: null, Category: null};
  else if (Description.match(/New S And S Cafe Greenville SC/i))  categorizedTransactionData = {Budget: "Eating Out", DescriptionDisplay: "S & S Cafeteria", Notes: null, Category: null};
  else if (Description.match(/The Blue Ridge Brewing Greenville SC/i))  categorizedTransactionData = {Budget: "Eating Out", DescriptionDisplay: "The Blue Ridge Brewing Company", Notes: null, Category: null};
  else if (Description.match(/Carolina Ale House \w+ \w+ \w{2}/i))  categorizedTransactionData = {Budget: "Eating Out", DescriptionDisplay: "Carolina Ale House", Notes: null, Category: null};
  else if (Description.match(/OCharleys\d+\w+ \w+ \w{2}/i))  categorizedTransactionData = {Budget: "Eating Out", DescriptionDisplay: "O'Charley's Restaurant & Bar", Notes: null, Category: null};
  else if (Description.match(/Flavorshack Hot Chicke Duncan SC/i))  categorizedTransactionData = {Budget: "Eating Out", DescriptionDisplay: "Flavorshack Hot Chicken & Ribs", Notes: null, Category: null};
  else if (Description.match(/Auntie Anne s #\w+ \w+ \w{2}/i))  categorizedTransactionData = {Budget: "Eating Out", DescriptionDisplay: "Auntie Anne's", Notes: null, Category: null};
  else if (Description.match(/River Street Sweets SA \w+ \w{2}/i))  categorizedTransactionData = {Budget: "Eating Out", DescriptionDisplay: "River Street Sweets", Notes: null, Category: null};
  else if (Description.match(/CornDogs by Mr Cow - \w+ \w+ \w{2}/i))  categorizedTransactionData = {Budget: "Eating Out", DescriptionDisplay: "Corn Dogs by Mr. Cow", Notes: null, Category: null};
  
  //Family Fun
  else if (Description.match(/Regal [\w ]+ \d+ \w+ \w{2}/i))  categorizedTransactionData = {Budget: "Family Fun", DescriptionDisplay: "Regal Cinemas", Notes: null, Category: null};
  else if (Description.match(/NCG SPARTANBURG (?:CINEMA SPARTANBURG SC|OWOSSO MI)/i))  categorizedTransactionData = {Budget: "Family Fun", DescriptionDisplay: "NCG Cinema", Notes: null, Category: null};
  else if (Description.match(/Shipwreck Cove Duncan SC/i))  categorizedTransactionData = {Budget: "Family Fun", DescriptionDisplay: "Shipwreck Cove", Notes: null, Category: null};
  else if (Description.match(/Fall For Greenville Greenville SC/i))  categorizedTransactionData = {Budget: "Family Fun", DescriptionDisplay: "Fall For Greenville", Notes: null, Category: null};
  else if (Description.match(/SpareTimeGreenville EC 8644120299 SC/i))  categorizedTransactionData = {Budget: "Family Fun", DescriptionDisplay: "Spare Time Entertainment", Notes: null, Category: null};
  else if (Description.match(/SQ \*SKY TOP ORCHARD ZIRCONIA NC/i))  categorizedTransactionData = {Budget: "Family Fun", DescriptionDisplay: "Sky Top Orchard", Notes: null, Category: null};
  else if (Description.match(/Hearts of Clay Spartanburg SC/i))  categorizedTransactionData = {Budget: "Family Fun", DescriptionDisplay: "Hearts of Clay", Notes: null, Category: null};

  //Church
  else if (matches = Description.match(/Brookwood Church (Donat Simpsonville|Cafe Simpsonville|8646888200) SC/i))  categorizedTransactionData = {Budget: "Church", DescriptionDisplay: "Brookwood Church", Notes: (matches[1].match(/cafe/i) ? "cafe" : "online giving"), Category: null};

  //Personal Spending

  //Childcare
  else if (Description.match(/GIGGLES DROP[- ]IN CHIL(?:DC)? GREENVILLE SC/i))  categorizedTransactionData = {Budget: "Childcare", DescriptionDisplay: "Giggles Drop-In Childcare", Notes: null, Category: null};
  else if (Description.match(/SQ \*KIDSZONE DROP-IN H GREENVILLE SC/i))  categorizedTransactionData = {Budget: "Childcare", DescriptionDisplay: "KidsZone Drop-In Childcare", Notes: null, Category: null};

  //Other
  else if (matches = Description.match(/ELECTRONIC\/ACH CREDIT IRS TREAS 310 ([\w ]+) \d{10}/i))  categorizedTransactionData = {Budget: "Miscellaneous", DescriptionDisplay: `Internal Revenue Service ${matches[1]}`, Notes: null, Category: null};
  else if (matches = Description.match(/ELECTRONIC\/ACH CREDIT SC STATE TREASUR ([\w ]+) \d{10}/i))  categorizedTransactionData = {Budget: "Miscellaneous", DescriptionDisplay: `South Carolina Treasury ${matches[1]}`, Notes: null, Category: null};
  else if (Description.match(/(?:SPARTANBURGCO TREAS 8645962603|Spartanburg County Tre 864-596-2603) SC USA/i))  categorizedTransactionData = {Budget: "Miscellaneous", DescriptionDisplay: "Spartanburg County Treasury", Notes: null, Category: null};
  else if (Description.match(/K12\*SPARTANBURG5 800-5418999 SC/i))  categorizedTransactionData = {Budget: "Miscellaneous", DescriptionDisplay: "District Five Schools of Spartanburg County", Notes: null, Category: null};
  else if (Description.match(/ELECTRONIC\/ACH CREDIT SHFECU SV WEBXFR \w{3} \d{10}/i))  categorizedTransactionData = {Budget: "Miscellaneous", DescriptionDisplay: "Sharonview", Notes: null, Category: null};
  else if (Description.match(/HAMPTON INN \w+ \w+ \w{2}/i))  categorizedTransactionData = {Budget: "Miscellaneous", DescriptionDisplay: "Hampton by Hilton", Notes: null, Category: null};
  else if (Description.match(/HOMES TO SUITES BY HIL \w+ \w{2}/i))  categorizedTransactionData = {Budget: "Miscellaneous", DescriptionDisplay: "Homes2 Suites by Hilton", Notes: null, Category: null};
  else if (Description.match(/Embassy S(?:ui)?tes \w+ \w+ \w{2}/i))  categorizedTransactionData = {Budget: "Miscellaneous", DescriptionDisplay: "Embassy Suites by Hilton", Notes: null, Category: null};
  else if (Description.match(/Residence Inn \w+ \w+ \w{2}/i))  categorizedTransactionData = {Budget: "Miscellaneous", DescriptionDisplay: "Residence Inn by Marriott", Notes: null, Category: null};
  else if (Description.match(/Courtyard by Marriott \w+ \w{2}/i))  categorizedTransactionData = {Budget: "Miscellaneous", DescriptionDisplay: "Courtyard by Marriott", Notes: null, Category: null};
  else if (Description.match(/(?:THE HOME DEPOT #?\d+ \w+|HOMEDEPOT\.COM 800-430-3376) \w{2}/i))  categorizedTransactionData = {Budget: "Miscellaneous", DescriptionDisplay: "The Home Depot", Notes: null, Category: null};
  else if (Description.match(/Lowes #\d+\* \w+ \w{2}/i))  categorizedTransactionData = {Budget: "Miscellaneous", DescriptionDisplay: "Lowe's", Notes: null, Category: null};
  else if (Description.match(/ADVANCE AUTO PARTS #\d+ \w+ \w{2}/i))  categorizedTransactionData = {Budget: "Miscellaneous", DescriptionDisplay: "Advance Auto Parts", Notes: null, Category: null};
  else if (Description.match(/HARBOR FREIGHT TOOLS \d \w+ \w{2}/i))  categorizedTransactionData = {Budget: "Miscellaneous", DescriptionDisplay: "Harbor Freight", Notes: null, Category: null};
  else if (Description.match(/CLASSIC ACE HARDWARE \w+ \w{2}/i))  categorizedTransactionData = {Budget: "Miscellaneous", DescriptionDisplay: "Classic Ace Hardware", Notes: null, Category: null};
  else if (Description.match(/(?:AMAZON\.COM|AMZN MKTP US)(?:\*\w+(?: A|\w+))? (?:(?:AMZN\.COM )?AMZN\.COM[\/ ]BILL|SEATTLE) ?WA/i))  categorizedTransactionData = {Budget: "Miscellaneous", DescriptionDisplay: "Amazon", Notes: null, Category: null};
  else if (Description.match(/DILLARDS \d+ [\w ]+ \w+ \w{2}/i))  categorizedTransactionData = {Budget: "Miscellaneous", DescriptionDisplay: "Dillard's", Notes: null, Category: null};
  else if (Description.match(/BELK #\d+ \w+ \w+ \w{2}/i))  categorizedTransactionData = {Budget: "Miscellaneous", DescriptionDisplay: "Belk", Notes: null, Category: null};
  else if (Description.match(/Hobby Lobby #\d+ \w+ \w{2}/i))  categorizedTransactionData = {Budget: "Miscellaneous", DescriptionDisplay: "Hobby Lobby", Notes: null, Category: null};
  else if (Description.match(/Michaels Stores \d+ \w+ \w{2}/i))  categorizedTransactionData = {Budget: "Miscellaneous", DescriptionDisplay: "Michaels", Notes: null, Category: null};
  else if (Description.match(/Ross Stores? #\d+ \w+ \w{2}/i))  categorizedTransactionData = {Budget: "Miscellaneous", DescriptionDisplay: "Ross Stores", Notes: null, Category: null};
  else if (Description.match(/Burlington Stores \d+ \w+ \w{2}/i))  categorizedTransactionData = {Budget: "Miscellaneous", DescriptionDisplay: "Burlington", Notes: null, Category: null};
  else if (Description.match(/Marshalls #\d+ \w+ \w{2}/i))  categorizedTransactionData = {Budget: "Miscellaneous", DescriptionDisplay: "Marshalls", Notes: null, Category: null};
  else if (Description.match(/TJ Maxx #\d+ \w+ \w{2}/i))  categorizedTransactionData = {Budget: "Miscellaneous", DescriptionDisplay: "T.J. Maxx", Notes: null, Category: null};
  else if (Description.match(/H&M\d+ \w+ \w{2}/i))  categorizedTransactionData = {Budget: "Miscellaneous", DescriptionDisplay: "H&M", Notes: null, Category: null};
  else if (Description.match(/World Market #\d+ \w+ \w{2}/i))  categorizedTransactionData = {Budget: "Miscellaneous", DescriptionDisplay: "World Market", Notes: null, Category: null};
  else if (Description.match(/Switcharoos \w+ \w{2}/i))  categorizedTransactionData = {Budget: "Miscellaneous", DescriptionDisplay: "Switch-A-Roos", Notes: null, Category: null};
  else if (Description.match(/Classy Kids Consignmen \w+ \w{2}/i))  categorizedTransactionData = {Budget: "Miscellaneous", DescriptionDisplay: "Classy Kids Consignment", Notes: null, Category: null};
  else if (Description.match(/Carter's #\d+ \w+ \w{2}/i))  categorizedTransactionData = {Budget: "Miscellaneous", DescriptionDisplay: "Carter's", Notes: null, Category: null};
  else if (Description.match(/Finds and Designs \w+ \w{2}/i))  categorizedTransactionData = {Budget: "Miscellaneous", DescriptionDisplay: "Finds & Designs", Notes: null, Category: null};
  else if (Description.match(/Etsy\.com - .+ Brooklyn NY/i))  categorizedTransactionData = {Budget: "Miscellaneous", DescriptionDisplay: "Etsy", Notes: null, Category: null};
  else if (Description.match(/BESTBUYCOM\d{12} 888-?BESTBUY MN/i))  categorizedTransactionData = {Budget: "Miscellaneous", DescriptionDisplay: "Best Buy", Notes: null, Category: null};
  else if (Description.match(/STAPLES \d+ \w+ \w{2}/i))  categorizedTransactionData = {Budget: "Miscellaneous", DescriptionDisplay: "Staples", Notes: null, Category: null};
  else if (Description.match(/BIG LOTS (?:STORES - )?#\d+ \w+ \w{2}/i))  categorizedTransactionData = {Budget: "Miscellaneous", DescriptionDisplay: "Big Lots", Notes: null, Category: null};
  else if (Description.match(/AT HOME STORE \d+ \w+ \w{2}/i))  categorizedTransactionData = {Budget: "Miscellaneous", DescriptionDisplay: "At Home", Notes: null, Category: null};
  else if (Description.match(/IKEA \w+ (?:REST )?\w+ \w{2}/i))  categorizedTransactionData = {Budget: "Miscellaneous", DescriptionDisplay: "IKEA", Notes: null, Category: null};
  else if (Description.match(/FIVE BELOW \d+ \w+ \w{2}/i))  categorizedTransactionData = {Budget: "Miscellaneous", DescriptionDisplay: "Five Below", Notes: null, Category: null};
  else if (Description.match(/2ND AND CHARLES \d+ \w+ \w{2}/i))  categorizedTransactionData = {Budget: "Miscellaneous", DescriptionDisplay: "2nd & Charles", Notes: null, Category: null};
  else if (Description.match(/MED\*(?:PRISMA|GREENVILLE) HEALTH 844-(?:644-3160|302-8298) SC/i))  categorizedTransactionData = {Budget: "Miscellaneous", DescriptionDisplay: "Prisma Health", Notes: null, Category: null};
  else if (Description.match(/9999 UMG MY CHART PT P 864-4542000 SC/i))  categorizedTransactionData = {Budget: "Miscellaneous", DescriptionDisplay: "Prisma Health MyChart", Notes: null, Category: null};
  else if (Description.match(/Crescent Family Dentis Greer SC/i))  categorizedTransactionData = {Budget: "Miscellaneous", DescriptionDisplay: "Crescent Family Dentistry", Notes: null, Category: null};
  else if (Description.match(/AIRBNB \w+ (?:4158005959|8554247262) CA/i))  categorizedTransactionData = {Budget: "Miscellaneous", DescriptionDisplay: "Airbnb", Notes: null, Category: null};
  else if (Description.match(/SQ \*Brown Roof Thrift \w+ \w{2}/i))  categorizedTransactionData = {Budget: "Miscellaneous", DescriptionDisplay: "Brown Roof Thrift", Notes: null, Category: null};
  else if (Description.match(/GROUPON INC. 312-288-6424 IL/i))  categorizedTransactionData = {Budget: "Miscellaneous", DescriptionDisplay: "Groupon", Notes: null, Category: null};
  else if (Description.match(/MASTER S MARK DRY CLEA \w+ \w{2}/i))  categorizedTransactionData = {Budget: "Miscellaneous", DescriptionDisplay: "Master's Mark Dry Cleaners", Notes: null, Category: null};
  else if (Description.match(/Guitar Center #\d+ \w+ \w{2}/i))  categorizedTransactionData = {Budget: "Miscellaneous", DescriptionDisplay: "Guitar Center", Notes: null, Category: null};
  else if (Description.match(/AFC U(?:rgent )?C(?:are)? \w+ \w{2}/i))  categorizedTransactionData = {Budget: "Miscellaneous", DescriptionDisplay: "AFC Urgent Care", Notes: null, Category: null};
  else if (Description.match(/(?:SQ \*)?Samaritan's Purse Boone NC/i))  categorizedTransactionData = {Budget: "Miscellaneous", DescriptionDisplay: "Samaritan's Purse", Notes: null, Category: null};
  else if (Description.match(/PADDLE\.NET\* TEXTXPANDR ASTORIA NY/i))  categorizedTransactionData = {Budget: "Miscellaneous", DescriptionDisplay: "TextExpander Individual Plan", Notes: null, Category: null};
  else if (Description.match(/SHERWIN WILLIAMS \d+ \w+ \w{2}/i))  categorizedTransactionData = {Budget: "Miscellaneous", DescriptionDisplay: "Sherwin Williams", Notes: null, Category: null};
  else if (Description.match(/Barnes & Noble #\d+ \w+ \w{2}/i))  categorizedTransactionData = {Budget: "Miscellaneous", DescriptionDisplay: "Barnes & Noble", Notes: null, Category: null};
  else if (Description.match(/\*Shear Necessities Lyman SC/i))  categorizedTransactionData = {Budget: "Miscellaneous", DescriptionDisplay: "Shear Necessities", Notes: null, Category: null};
  
  //If there was no match, return the original transaction
  else return transaction;

  //Final categorizedTransactionData
  categorizedTransactionData = {
    //only add a budget/displayed description/notes, based on the description, if one is not already present
    Budget: Budget || categorizedTransactionData.Budget,
    DescriptionDisplay: DescriptionDisplay || categorizedTransactionData.DescriptionDisplay,
    Notes: Notes || categorizedTransactionData.Notes,
    Category: Category || categorizedTransactionData.Category,
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
    Budget: transaction.Budget || "",
    Notes: transaction.Notes || "",
    Category: transaction.Category || "",
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

export const isBudgetedIncomeTransaction = transaction=>{
  return transaction.Budget?.match(/payroll|^Other income$/i);
};

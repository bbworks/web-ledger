//Initialize variables
const form = document.getElementById("transaction-form");
const fileInput = document.getElementById("transaction-form-input-file");
const dataDiv = document.querySelector(".transaction-data");
const table = dataDiv.querySelector("table");

//Create utility functions
const convertCSVToJSON = function(csv, delimiter = ",") {
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

//Create functions
const importTransactions = function(transactionData, isCSV) {
  const convertDateStringToDate = function(dateString) {
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

  try {
    let transactions;

    //If this is CSV data
    if (isCSV) {
      //For each CSV file, convert the contents to JSON
      transactions = transactionData.map(csvData=>
        //Convert the CSV data to JSON
        convertCSVToJSON(csvData)
          //Format each transaction object
          .map(transaction=>{
            const type = (transaction.Charges ? "Charges" : (transaction.Payments ? "Payments" : null));
            const dateIsMatch = transaction.Date.match(/(\d{2})\/(\d{2})\/(\d{4})/);
            if (!type || !dateIsMatch) throw `Unable to read transaction.\r\n${transaction}`;

            return {
              PostedDate: null,
              TransactionDate: new Date(dateIsMatch[3], Number(dateIsMatch[1])-1, dateIsMatch[2]),
              Card: `*${transaction["Card No."]}`,
              Description: transaction.Description,
              Type: type,
              Amount: Number(`${(type === "Charges" ? "-" : "")}${transaction[type]}`),
            };
          })
      )
        .flat();
    }
    //Otherwise, this is scraped from online app
    else {
      //Spilt the string of transactions into an array
      const transactionsArray = transactionData.split("POSTED:")
        //Filter out empty data
        .filter(transaction=>!!transaction)
        //Remove unwanted data from the transactions
        .map(transaction=>transaction.replace("\tPending Transactions Ends", ""));

      //Massage the data into intelligible objects
      transactions = transactionsArray.map(transaction=>{
        //Parse the transaction string into an object
        const isMatch = transaction.match(/(PENDING|(\w+)\s*(\d+))\s*TRANSACTION:(\w+)\s*(\d+)\s+(?:Card No:([\*\d]+)\s*)?Description:(.+)\s*(Charges|Payments):(-?)\$([\d,]+\.\d{2})\s*/);
        if (!isMatch) throw `Unable to read transaction.\r\n${transaction}`;
        const matches = isMatch.map(match=>(match ? match.trim() : match))
        return {
          PostedDate: (matches[1] === "PENDING" ? null : convertDateStringToDate(`${matches[2]} ${matches[3]}`)),
          TransactionDate: convertDateStringToDate(`${matches[4]} ${matches[5]}`),
          Card: matches[6],
          Description: matches[7],
          Type: matches[8],
          Amount: Number(`${matches[9]}${matches[10]}`.replace(",","")) * -1,
        };
      })
      .reverse();
    }

    //Update the transactions
    updateTransactions(transactions);

    //Return the transaction objects
    return transactions;
  }
  catch (err) {
    throw err;
  }
};

// const formatTransactions = function(transactions) {
//   return transactions.map(transaction=>{
//     const {PostedDate, TransactionDate, Card, Description, Type, Amount} = transaction;
//     return `${Description}\t\t${Amount}`;
//   })
//   .join("\r\n");
// };

//Initialize functions
const filterTransactions = function (transactions) {
  return transactions.filter(transaction=>(transaction.Description ? transaction.Description.toUpperCase() !== "PAYMENT - THANK YOU ATLANTA GA" : true));
};

const formatTransactions = function(transactions) {
  return transactions.map(transaction=>{
    return {
      ...transaction,
      Description: transaction.Description.replace(/([\w\'&]+)/g, p1=>p1[0].toUpperCase() + p1.substring(1).toLowerCase()),
      PostedDate: (transaction.PostedDate && new Date(transaction.PostedDate).toLocaleDateString()),
      TransactionDate: (transaction.TransactionDate && new Date(transaction.TransactionDate).toLocaleDateString()),
      Amount: transaction.Amount.toFixed(2),
    }
  });
};

const updateTransactions = function(transactions) {
  //Save the data to localStorage
  localStorage.setItem("transaction-data", JSON.stringify(transactions));

  //Filter out transactions
  transactions = filterTransactions(transactions);

  //Format the transaction data
  transactions = formatTransactions(transactions);

  //Render the transactions table
  renderTable(transactions);
};

const renderTable = function(transactions) {
  //Define the table headers
  const tableHeaders = `<thead>
      <tr>
        <th>Posted Date</th>
        <th>Transaction Date</th>
        <th>Type</th>
        <th>Category</th>
        <th>Description</th>
        <th>Notes</th>
        <th>Amount</th>
      </tr>
    </thead>`;

  const tableBody = `<tbody></tbody>`;

  //Clear the table
  table.innerHTML = "";

  //Append the table headers
  table.innerHTML += tableHeaders;

  //Append the table body
  table.innerHTML += tableBody;

  //Render the transactions
  renderTransactions(transactions);

  //Update the transaction import form status
  const statusDiv = form.querySelector("#transaction-form-status");
  statusDiv.innerHTML = `<p class="text-success">Imported ${transactions.length} transactions.</p>`;

  //Update the number of transactions
  const countDiv = dataDiv.querySelector(".transaction-count");
  countDiv.innerHTML = `<small><em>${transactions.length} transactions</em></small>`;
}

const renderTransactions = function(transactions) {
  const validateDescription = function(description) {
    //Bills
    if (description.match(/Spectrum 855-707-7328 SC/i))  return {category: "Spectrum Internet", description: "Charge to CCD *3991", notes: null};
    if (description.match(/Simplisafe 888-957-4675 Ma/i))  return {category: "SimpliSafe (for mom)", description: "Charge to CCD *3991", notes: null};
    if (description.match(/SDC\*Laurens Electric C Laurens SC/i))  return {category: "Laurens Electric ProTec Security", description: "Charge to CCD *3991", notes: null};
    if (description.match(/SJWD Water District 8649492805 SC/i))  return {category: "SJWD Water District", description: "Charge to CCD *3991", notes: null};
    if (description.match(/State Farm Insurance 8009566310 Il/i))  return {category: "State Farm auto insurance", description: "Charge to CCD *3991", notes: null};
    if (description.match(/Spotify USA New York NY/i))  return {category: "Spotify Premium subscription", description: "Charge to CCD *3991", notes: null};
    if (description.match(/Netflix.Com Netflix.Com Ca/i))  return {category: "Netflix Premium subscription", description: "Charge to CCD *3991", notes: null};
    if (description.match(/Ddv \*Discoveryplus 0123456789 TN/i))  return {category: "Discovery Plus subscription", description: "Charge to CCD *3991", notes: null};
    if (description.match(/AT&T \*Payment 800-288-2020 TX/i))  return {category: "AT&T Internet", description: "Charge to CCD *3991", notes: null};

    //Recurring expenses

    //Gas
    if (description.match(/QT \d+ (?:OUTSIDE|\w+ \w{2})/i)) return {category: "Gas", description: "QuikTrip", notes: null};
    if (description.match(/CIRCLE K # \d+ \w+ \w{2}/i)) return {category: "Gas", description: "Circle K", notes: null};
    if (description.match(/7-ELEVEN \d+ \w+ \w{2}/i)) return {category: "Gas", description: "7-Eleven", notes: null};

    //Groceries & Necessities
    if (description.match(/Walmart Grocery [\d-]+ Ar/i)) return {category: "Groceries/Necessities", description: "Walmart Supercenter", notes: "grocery pickup"};
    if (description.match(/Target #\d+ \w+ \w{2}/i)) return {category: "Groceries/Necessities", description: "Target", notes: null};
    if (description.match(/Ingles Markets #\d+ \w+ \w{2}/i)) return {category: "Groceries/Necessities", description: "Ingles", notes: null};
    if (description.match(/Publix #\d+ \w+ \w{2}/i)) return {category: "Groceries/Necessities", description: "Publix", notes: "grocery pickup"};
    if (description.match(/(?:SamsClub #8142 Spartanburg SC|Sams Club #8142 864-574-3480 SC)/i)) return {category: "Groceries/Necessities", description: "Sam's Club", notes: null};

    if (description.match(/Walgreens #\d+/i)) return {category: "Groceries/Necessities", description: "Walgreens", notes: null};

    //Family Outings
    if (description.match(/McDonald's \w+ \w+ \w{2}/i))  return {category: "Family Outings", description: "McDonald's", notes: null};
    if (description.match(/Burger King #\d+(?: \w+ \w+ \w{2})?/i))  return {category: "Family Outings", description: "Burger King", notes: null};
    if (description.match(/PDQ \d+ OLO \w+ \w{2}/i))  return {category: "Family Outings", description: "PDQ", notes: null};
    if (description.match(/Chick-Fil-A #\d+ \w+ \w{2}/i))  return {category: "Family Outings", description: "Chick-fil-A", notes: null};
    if (description.match(/Bojangles \d+ \w+/i))  return {category: "Family Outings", description: "Bojangles", notes: null};
    if (description.match(/Cook Out [\w ]+(?: \w+ \w{2})?/i))  return {category: "Family Outings", description: "Cook Out", notes: null};
    if (description.match(/Wendys #\d+ \w+ \w{2}/i))  return {category: "Family Outings", description: "Wendy's", notes: null};
    if (description.match(/Sweet Basil Thai Cusin Greenville SC/i))  return {category: "Family Outings", description: "Sweet Basil Thai Cusine", notes: null};
    if (description.match(/Panda Hibachi Duncan SC/i))  return {category: "Family Outings", description: "Panda Hibachi", notes: null};
    if (description.match(/El Molcajete Duncan Sc/i))  return {category: "Family Outings", description: "El Molcajete", notes: null};
    if (description.match(/(?:Chipotle \d+ \w \w{2}|Chipotle Online 1800\d{6} CA)/i))  return {category: "Family Outings", description: "Chipotle", notes: null};
    if (description.match(/La Fogata Mexican Rest Simpsonville Sc/i))  return {category: "Family Outings", description: "La Fogata", notes: null};
    if (description.match(/Pizza Hut \d+ \d+ \w{2}/i))  return {category: "Family Outings", description: "Pizza Hut", notes: null};
    if (description.match(/Tutti Frutti Spartanburg SC/i))  return {category: "Family Outings", description: "Tutti Frutti", notes: null};

    //Church
    if (description.match(/Brookwood Church Donat Simpsonville Sc/i))  return {category: "Church", description: "Brookwood Church", notes: "online giving"};

    //Other
    if (description.match(/Dollartree \w+ \w{2}/i))  return {category: null, description: "Dollar Tree", notes: null};
    if (description.match(/[\w\* ]+ amzn.com\/billwa/i))  return {category: null, description: "Amazon", notes: null};

    //if (description.match(//i))  return {category: null, description: "desc", notes: null};
    return {category: null, description: `*${description}`, notes: null};
  };

  const tableData = transactions.map(transaction=>{
    const {Description, PostedDate, TransactionDate, Type, Amount} = transaction;
    const {description, notes, category} = validateDescription(Description);

    return `<tr>
      <td>${PostedDate}</td>
      <td>${TransactionDate}</td>
      <td>${Type}</td>
      <td>${(category ? category : "")}</td>
      <td>${description}</td>
      <td>${(notes ? notes : "")}</td>
      <td>${Amount}</td>
    </tr>`
  })
    .join("\r\n");

  //Append the table data to the table body
  const tableBody = table.querySelector("tbody");
  tableBody.innerHTML = "";
  tableBody.innerHTML += tableData;
};

const fetchTransactions = function() {
  //Attempt to fetch the transaction data from localStorage
  const transactions = JSON.parse(localStorage.getItem("transaction-data"));
  if (!transactions) return;

  //Update the transactions
  updateTransactions(transactions);
};

form.addEventListener("submit", event=>{
  //Prevent form submission
  event.preventDefault();

  //Get the transaction data
  const transactionData = form.querySelector(".form-input").value;

  //Import the transaction data into an array of transaction objects
  const transactions = importTransactions(transactionData);
});

fileInput.addEventListener("change", async event=>{
  //Prevent default behavior
  event.preventDefault();

  //Get the transaction data
  const transactionDataArray = [];
  await Promise.all(  //Promise.all handles an array of Promises
    [...fileInput.files].map(async file=>{
      const fileContent = await file.text();
      transactionDataArray.push(fileContent);
    })
  );

  //Import the transaction data into an array of transaction objects
  const transactions = importTransactions(transactionDataArray, true);

  //Reset the file input
  fileInput.value = "";
});

//Attempt an initial render
fetchTransactions();

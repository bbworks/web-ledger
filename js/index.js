//Initialize variables
const form = document.getElementById("transaction-form");
const table = document.querySelector("table");

//Create functions
let importTransactions = function(transactionsString) {
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
    let date = new Date(now.getFullYear(), monthIndex, day)

    //Adjust date backwards one year if this ends up being a future date
    if (date > now) date = new Date(date.setFullYear(date.getFullYear()-1));

    return date
  };

  try {
    //Spilt the string of transactions into an array
    const transactionsArray = transactionsString.split("POSTED:")
      //Filter out empty data
      .filter(transaction=>!!transaction)
      //Remove unwanted data from the transactions
      .map(transaction=>transaction.replace("\tPending Transactions Ends", ""));

    //Massage the data into intelligible objects
    const transactions = transactionsArray.map(transaction=>{
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

    //Return the transaction objects
    return transactions;
  }
  catch (err) {
    throw err;
  }
};

// let formatTransactions = function(transactions) {
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
      PostedDate: (transaction.PostedDate && transaction.PostedDate.toLocaleDateString()),
      TransactionDate: transaction.TransactionDate.toLocaleDateString(),
      Amount: transaction.Amount.toFixed(2),
    }
  });
};

const fetchTransactionData = function() {
  //Get the transaction data
  const localData = localStorage.getItem("transaction-data");
  if (localData) return renderTable(localData);
};

const renderTable = function(transactionData) {
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

  //Append the transactions
  renderTransactions(transactionData);
}

const renderTransactions = function(transactionData) {
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

  //Return an array of transaction objects
  let transactions = importTransactions(transactionData);

  //If the data was valid, save the data to localStorage
  localStorage.setItem("transaction-data", transactionData);

  //Filter out transactions
  transactions = filterTransactions(transactions);

  //Format the transaction data
  transactions = formatTransactions(transactions);

  const tableData = transactions.map(transaction=>{
    let {Description, PostedDate, TransactionDate, Type, Amount} = transaction;
    let {description, notes, category} = validateDescription(Description);

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

form.addEventListener("submit", event=>{
  //Prevent form submission
  event.preventDefault();

  //Get the transaction data
  const transactionData = form.querySelector(".form-input").value;

  //Render the new transaction data
  renderTable(transactionData);
});

//Attempt an initial render
fetchTransactionData();

//Initialize variables
const importForm = document.getElementById("transaction-import-form");
const fileInput = document.getElementById("transaction-import-form-input-file");
const dataDiv = document.querySelector(".transaction-data");
const table = dataDiv.querySelector("table");
const transactionLocalStorageItemKey = "transaction-data"

//Create utility functions
const isFalsy = function(value) {
  return value !== 0 && (!value || value == false);
};

const nullCoalesce = function(value) {
  if(isFalsy(arguments)) throw new Error("Function cannot accept 0 parameters.");
  return [...arguments].reduce((accumulator, value)=>accumulator = (isFalsy(accumulator) && !isFalsy(value) ? value : accumulator), null);
};

const convertNumberToCurrency = function(value) {
  return Number(value)
    .toFixed(2)
    .toString()
    .replace(/\d{4,}/, (p0)=>p0.split('').reverse().join('').replace(/(\d{3})(?=\d)/g, "$1,").split('').reverse().join('')) //add commas
    .replace(/(\d)/, "$$$1") //add $
};

const createDOMNode = function(HTML) {
  //If inserting a table row, use tbody as the container
  let container = document.createElement("div");
  if (HTML.match(/^\s*<tr/)) container = document.createElement("tbody");
  container.innerHTML = HTML;
  return container.firstChild;
};

const addTransactionModal = function(transaction, buttonsOptions = {okButton: "OK", cancelButton: "Cancel"}) {
  const header = "Transaction Detail";
  const {PostedDate, TransactionDate, Card, Amount, Description, Category, Notes} = transaction.display;
  const {Type, Tags} = transaction.data;

  const transactionFields= [
    {name: "PostedDate", placeholder: "PostedDate", value: PostedDate, tag: "input", tagType: "text",},
    {name: "TransactionDate", placeholder: "TransactionDate", value: TransactionDate, tag: "input", tagType: "text",},
    {name: "Card", placeholder: "Card", value: Card, tag: "input", tagType: "text",},
    {name: "Amount", placeholder: "Amount", value: Amount, tag: "input", tagType: "text",},
    {name: "Description", placeholder: "Description", value: Description, tag: "input", tagType: "text",},
    {name: "Category", placeholder: "Category", value: Category, tag: "input", tagType: "text",},
    {name: "Type", placeholder: "Type", value: Type, tag: "input", tagType: "text",},
    {name: "Notes", placeholder: "Notes", value: Notes, tag: "textarea", tagType: null,},
    {name: "Tags", placeholder: "Tags", value: Tags, tag: "input", tagType: "text",},
  ];
  //Create a modal DOM element
  const modalNode = createDOMNode(`<div id="transaction-modal" class="modal fade">
    <div class="modal-dialog">
      <form class="transaction-modal-form">
        <div class="modal-content">
          <div class="modal-header">
            <h3 class="modal-title">${header}</h3>
            <button class="btn-close" type="button" data-bs-dismiss="modal"></button>
          </div>
          <div class="modal-body"></div>
          <div class="modal-footer">
            ${Object.entries(buttonsOptions).map(buttonObj=>`<button class="btn ${(buttonObj[0] === "okButton" ? "btn-primary" : (buttonObj[0] === "cancelButton" ? "btn-secondary" : ''))}" type="${(buttonObj[0] === "okButton" ? "submit" : "button")}" ${(buttonObj[0] === "cancelButton" ? `data-bs-dismiss="modal"` : '')}>${buttonObj[1]}</button>`).join('')}
          </div>
        </div>
      </form>
    </div>`);

  const transactionModalBody = modalNode.querySelector(".modal-body");
  const transactionModalForm = modalNode.querySelector(".transaction-modal-form");

  transactionFields.forEach((transactionField, i)=>{
    const transactionFieldElementContainer = createDOMNode("<div></div>"); //disabled inputs don't fire events; wrap in something that will fire an event
    let transactionFieldElement;
    let transactionFieldElementWrapper;

    const addTagBadge = function(value, transactionFieldElementWrapper) {
      const transactionModalTagsContainer = transactionFieldElementWrapper;
      const tagsBadgeContainer = transactionFieldElementWrapper.querySelector(".transaction-modal-input-tags-badge-container");
      const hiddenTagsInput = transactionModalTagsContainer.querySelector(".transaction-modal-input-tags-hidden");

      //Add it to the hidden [name="Tags"] input
      hiddenTagsInput.value = [hiddenTagsInput.value.split(/\s*,\s*/).filter(tag=>!isFalsy(tag)), value].join(",");

      //Add a tag badge
      const tagBadge = createDOMNode(`<span class="transaction-modal-input-tags-badge badge rounded-pill">${value}</span>`);
      tagsBadgeContainer.appendChild(tagBadge);
      tagBadge.addEventListener("click", event=>{
        //Remove it from the hidden [name="Tags"] input
        hiddenTagsInput.value = [hiddenTagsInput.value.split(/\s*,\s*/).filter(tag=>!(tag === value))].join(",");

        //Remove tag badge
        tagsBadgeContainer.removeChild(tagBadge);
      });
    };

    if (transactionField.name === "Tags") {
      transactionFieldElement = createDOMNode(`<input class="transaction-modal-input transaction-modal-input-tags form-control" type="text" placeholder="${transactionField.placeholder}" tabindex="${i+1}" />`);
      transactionFieldElementWrapper = createDOMNode(`<div class="transaction-modal-input-tags-container form-control">
          <input class="transaction-modal-input-tags-hidden form-control" type="hidden" name="Tags" value="" />
          <div class="transaction-modal-input-tags-badge-container"></div>
        </div>
      `);
      transactionField.value.forEach(tag=>addTagBadge(tag, transactionFieldElementWrapper));
      transactionFieldElementWrapper.appendChild(transactionFieldElement);
      transactionModalBody.appendChild(transactionFieldElementContainer).appendChild(transactionFieldElementWrapper);
    }
    else {
      transactionFieldElement = createDOMNode(`<${transactionField.tag} class="transaction-modal-input transaction-modal-input-text form-control" ${(transactionField.tag === "input" ? `value="${(transactionField.value ? transactionField.value : '')}"` : '')} name="${transactionField.name}" ${(transactionField.tagType ? `type="${transactionField.tagType}"` : '')} placeholder="${transactionField.placeholder}" tabindex="${i+1}" disabled>${(transactionField.tag !== "input" ? (transactionField.value ? transactionField.value : '') : '')}</${transactionField.tag}>`);
      transactionModalBody.appendChild(transactionFieldElementContainer).appendChild(transactionFieldElement);
    }

    transactionFieldElementContainer.addEventListener("click", event=>{
      transactionFieldElement.disabled = false;
      transactionFieldElement.focus();
    });
    transactionFieldElement.addEventListener("blur", event=>{
      transactionFieldElement.disabled = true;
    });

    transactionFieldElement.addEventListener("keypress", event=>{
      if (event.keyCode === 13 /* Enter */) {
        event.preventDefault();

        if (transactionField.name === "Tags") {
          addTagBadge(transactionFieldElement.value, transactionFieldElementWrapper);

          //Reset the input
          transactionFieldElement.value = '';
        }

        transactionFieldElement.disabled = true;
      }
    });
    transactionFieldElement.addEventListener("keydown", event=>{
      if (event.keyCode === 9 /* Tab */) {
        const nextOrPrevious = (event.shiftKey === true ? -1 : 1);
        event.preventDefault();
        const inputsArray = [...transactionModalForm.querySelectorAll(".transaction-modal-input")];
        const nextInput = inputsArray[inputsArray.indexOf(transactionFieldElement)+nextOrPrevious];
        if (nextInput) {
          nextInput.disabled = false;
          nextInput.focus();
        }
      }
    });
  });

  transactionModalForm.addEventListener("submit", event=>{
    //Prevent the form from submitting
    event.preventDefault();

    //Aggregate the form data into an object
    const data = [...transactionModalForm.querySelectorAll("[name]")].reduce((accumulator,input)=>{
      const obj = {};
      let {name, value} = input;
      value = (name === "Tags" ? value.split(/\s*,\s*/): value);

      obj[name] = nullCoalesce(value);
      return accumulator = {...accumulator, ...obj};
    }, {});
    window.test = data;
    console.log(data);

    //Update the transaction with the new form data
    const updatedTransaction = {
      ...transaction,
      display: {
        ...transaction.display,
        ...data,
        Description: transaction.data.Description,
      }
    };
    const transactionIndex = transactions.indexOf(transaction);
    const updatedTransactions = [...transactions]; //create deep copy
    updatedTransactions.splice(transactionIndex, 1, updatedTransaction);

    //Update the transactions data
    importTransactions(updatedTransactions.map(updatedTransaction=>updatedTransaction.display));

    //Remove the modal dialog
    modal.hide();
  });

  //Create functions
  const destroyModal = function() {
    modal.dispose();
    modalNode.remove();
  };

  //Turn it into a Bootstrap Modal object
  const modal = new bootstrap.Modal(modalNode, {focus: true});

  modalNode.addEventListener("hidden.bs.modal", event=>destroyModal());

  document.body.appendChild(modalNode);

  modal.show();
};

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
const importTransactions = function(transactionData, dataType) {
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
        if (isFalsy(isMatch)) throw `Unable to read transaction.\r\n${transaction}`;
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
        if (isFalsy(type) || isFalsy(transactionDate)) throw `Unable to read transaction.\r\n${transaction}`;

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

    //Update the transactions
    updateTransactions(transactions);

    //Return the transaction objects
    return transactions;
  }
  catch (err) {
    throw err;
  }
};

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

const updateTransactions = function(transactions) {
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
  window.transactions = transactions;

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
        <th>Tags</th>
        <th></th>
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
  const statusDiv = importForm.querySelector("#transaction-import-form-status");
  statusDiv.innerHTML = `<p class="text-success">Imported ${transactions.length} transactions.</p>`;

  //Update the number of transactions
  const countDiv = dataDiv.querySelector(".transaction-count");
  countDiv.innerHTML = `<small><em>${transactions.length} transactions</em></small>`;
}

const renderTransactions = function(transactions) {
  //Empty the table
  const tableBody = table.querySelector("tbody");
  tableBody.innerHTML = "";

  transactions.forEach(transaction=>{
    const {Description, PostedDate, TransactionDate, Type, Amount, Notes, Category, Tags} = transaction.display;

    const transactionElement = createDOMNode(`<tr class="transaction">
      <td>${(PostedDate ? PostedDate : "")}</td>
      <td>${(TransactionDate ? TransactionDate : "")}</td>
      <td>${(Type ? Type : "")}</td>
      <td>${(Category ? Category : "")}</td>
      <td>${(Description ? Description : "")}</td>
      <td>${(Notes ? Notes : "")}</td>
      <td>${(Amount ? Amount : "")}</td>
      <td>${(Tags ? Tags.map(tag=>`<span class="badge rounded-pill bg-secondary">${tag}</span>`).join('') : "")}</td>
      <td><button class="transaction-button btn" type="button"><i class="transaction-button-icon fas fa-edit"></i></button></td>
    </tr>`);

    transactionElement.querySelector(".transaction-button").addEventListener("click", (event)=>{
      addTransactionModal(transaction, {okButton: "Save", cancelButton: "Cancel"});
    });

    //Append the table data to the table body
    tableBody.appendChild(transactionElement);
  });

  const totalAmount = Number(transactions.reduce((accumulator, transaction)=>accumulator += (transaction.data.Type == "Charges" ? transaction.data.Amount : 0), 0).toFixed(2));
  const totalString = convertNumberToCurrency(totalAmount);
  totalElement = createDOMNode(`<tr class="total">
    <td></td>
    <td></td>
    <td></td>
    <td></td>
    <td></td>
    <td></td>
    <td>${totalString}</td>
    <td></td>
    <td></td>
  </tr>`);

  //Append the table data to the table body
  tableBody.appendChild(totalElement);
};

const fetchTransactions = function() {
  //Attempt to fetch the transaction data from localStorage
  const transactions = JSON.parse(localStorage.getItem(transactionLocalStorageItemKey));
  if (isFalsy(transactions)) return;

  //Update the transactions
  updateTransactions(transactions);
};

importForm.addEventListener("submit", event=>{
  //Prevent form submission
  event.preventDefault();

  //Get the transaction data
  const transactionData = importForm.querySelector("#transaction-import-input").value;

  //Import the transaction data into an array of transaction objects
  const transactions = importTransactions(transactionData, "scraped");
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
  const transactions = importTransactions(transactionDataArray, "csv");

  //Reset the file input
  fileInput.value = "";
});

//Attempt an initial render
fetchTransactions();

//Import modules
const TransactionsApi = require("../api/transactions");


//Define controllers
const get = async (request, response) => {
  try {
    //Call the getTransactions API
    /* DEBUG */ console.info(`>[${new Date().toJSON()}] >GET /api/v1/transactions`);
    const results = await TransactionsApi.getTransactions();
    /* DEBUG */ console.info(`>[${new Date().toJSON()}] >Response: GET /api/v1/transactions |\r\n`, results);

    response.json({data: results,});
  }
  catch (err) {
    console.log("ERROR:", err);
    response.status(500).json({
      error: err,
    });
  }
}

const show = async (request, response)=>{
  try {
    //Destructure the request object
    const {params: {transaction_id: transactionId}} = request;

    //Call the getTransaction API
    const results = await TransactionsApi.getTransaction(transaction_id);

    response.json({data: results,});
  }
  catch (err) {
    console.log("ERROR:", err);
    response.status(500).json({
      error: err,
    });
  }
}

const save = async (request, response)=>{
  try {
    //Destructure the request object
    const {body: {transactions}} = request;

    //Call the updateTransactions API
    //const results = await TransactionsApi.updateTransactions(transactions);
    console.log("await TransactionsApi.updateTransactions(transactions)");

    response.json({data: results,});
  }
  catch (err) {
    console.log("ERROR:", err);
    response.status(500).json({
      error: err,
    });
  }
}

const update = async (request, response)=>{
  try {
    //Destructure the request object
    const {params: {transaction_id: transactionId}, body: {transaction}} = request;

    //Call the updateTransaction API
    //const results = await TransactionsApi.updateTransaction(transactionId, transaction);
    console.log("await TransactionsApi.updateTransaction(transactionId, transaction)");

    response.json({data: results,});
  }
  catch (err) {
    console.log("ERROR:", err);
    response.status(500).json({
      error: err,
    });
  }
}

module.exports = {
  get,
  show,
  save,
  update,
}

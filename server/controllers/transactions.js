//Import modules
const util = require('util');
const TransactionsApi = require("../api/transactions");


//Define controllers
const list = async (request, response) => {
  try {
    //Call the getTransactions API
    /* DEBUG */ console.info(`>[${new Date().toJSON()}] >GET /api/v1/transactions`);
    const results = await TransactionsApi.getTransactions();
    /* DEBUG */ console.log(`>[${new Date().toJSON()}] >Response: GET /api/v1/transactions |\r\n`);
    /* DEBUG */ console.log(util.inspect(results, {'maxArrayLength': 2, 'depth': null, 'colors': true}));

    response.json({data: results,});
  }
  catch (err) {
    let host;
    if ((host = err.toString().match("Error: connect ECONNREFUSED (.+)")) && (host = host[1])) {
      /* DEBUG */ console.info(`>[${new Date().toJSON()}] >FAILED: GET /api/v1/transactions |\r\nERROR: Could not connect to host "${host}".`);
      return response.status(503).json({
        error: err,
      });
    }

    /* DEBUG */ console.info(`>[${new Date().toJSON()}] >FAILED: GET /api/v1/transactions |\r\n`, err);
    return response.status(500).json({
      error: err,
    });
  }
}

const get = async (request, response)=>{
  try {
    //Destructure the request object
    const {params: {transaction_id: transactionId}} = request;

    //Call the getTransaction API
    /* DEBUG */ console.info(`>[${new Date().toJSON()}] >GET /api/v1/transactions/:transaction_id`);
    const results = await TransactionsApi.getTransaction(transactionId);
    /* DEBUG */ console.info(`>[${new Date().toJSON()}] >Response: GET /api/v1/transactions/:transaction_id |\r\n`, results);

    response.json({data: results,});
  }
  catch (err) {
    /* DEBUG */ console.info(`>[${new Date().toJSON()}] >FAILED: GET /api/v1/transactions/:transaction_id |\r\n`, err);
    return response.status(500).json({
      error: err,
    });
  }
}

const create = async (request, response)=>{
  try {
    //Destructure the request object
    const {body: {transaction}} = request;

    //Call the getTransaction API
    /* DEBUG */ console.info(`>[${new Date().toJSON()}] >POST /api/v1/transactions`);
    const results = await TransactionsApi.createTransaction(transaction);
    /* DEBUG */ console.info(`>[${new Date().toJSON()}] >Response: POST /api/v1/transactions |\r\n`, results);

    response.json({data: results,});
  }
  catch (err) {
    /* DEBUG */ console.info(`>[${new Date().toJSON()}] >FAILED: POST /api/v1/transactions |\r\n`, err);
    return response.status(500).json({
      error: err,
    });
  }
}

const save = async (request, response)=>{
  try {
    //Destructure the request object
    const {body: {transactions}} = request;

    //Call the updateTransactions API
    /* DEBUG */ console.info(`>[${new Date().toJSON()}] >POST /api/v1/transactions/save`);
    const results = await TransactionsApi.updateTransactions(transactions);
    /* DEBUG */ console.info(`>[${new Date().toJSON()}] >Response: POST /api/v1/transactions/save |\r\n`, results);

    response.json({data: results,});
  }
  catch (err) {
    /* DEBUG */ console.info(`>[${new Date().toJSON()}] >FAILED: POST /api/v1/transactions/save |\r\n`, err);
    return response.status(500).json({
      error: err,
    });
  }
}

const update = async (request, response)=>{
  try {
    //Destructure the request object
    const {params: {transaction_id: transactionId}, body: {transaction, updates}} = request;

    //Call the updateTransaction API
    /* DEBUG */ console.info(`>[${new Date().toJSON()}] >PUT /api/v1/transactions/:transaction_id`);
    const results = await TransactionsApi.updateTransaction(transactionId, transaction, updates);
    /* DEBUG */ console.info(`>[${new Date().toJSON()}] >Response: PUT /api/v1/transactions/:transaction_id |\r\n`, results);

    response.json({data: results,});
  }
  catch (err) {
    /* DEBUG */ console.info(`>[${new Date().toJSON()}] >FAILED: PUT /api/v1/transactions/:transaction_id |\r\n`, err);
    return response.status(500).json({
      error: err,
    });
  }
}

const destroy = async (request, response)=>{
  try {
    //Destructure the request object
    const {params: {transaction_id: transactionId}} = request;

    //Call the deleteTransaction API
    /* DEBUG */ console.info(`>[${new Date().toJSON()}] >DELETE /api/v1/transactions/:transaction_id`);
    const results = await TransactionsApi.deleteTransaction(transactionId);
    /* DEBUG */ console.info(`>[${new Date().toJSON()}] >Response: DELETE /api/v1/transactions/:transaction_id |\r\n`, results);

    response.json({data: results,});
  }
  catch (err) {
    /* DEBUG */ console.info(`>[${new Date().toJSON()}] >FAILED: DELETE /api/v1/transactions/:transaction_id |\r\n`, err);
    return response.status(500).json({
      error: err,
    });
  }
}

module.exports = {
  list,
  get,
  create,
  save,
  update,
  destroy,
}

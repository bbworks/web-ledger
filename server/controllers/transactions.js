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
    /* DEBUG */ console.info(`>[${new Date().toJSON()}] >FAILED: GET /api/v1/transactions |\r\n`, err);
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
    /* DEBUG */ console.info(`>[${new Date().toJSON()}] >GET /api/v1/transactions/:transaction_id`);
    const results = await TransactionsApi.getTransaction(transaction_id);
    /* DEBUG */ console.info(`>[${new Date().toJSON()}] >Response: GET /api/v1/transactions/:transaction_id |\r\n`, results);

    response.json({data: results,});
  }
  catch (err) {
    /* DEBUG */ console.info(`>[${new Date().toJSON()}] >FAILED: GET /api/v1/transactions/:transaction_id |\r\n`, err);
    response.status(500).json({
      error: err,
    });
  }
}

const save = async (request, response)=>{
  try {
    //Destructure the request object
    const {body: {transactions}} = request;
    console.log("test",request.body);

    //Call the updateTransactions API
    /* DEBUG */ console.info(`>[${new Date().toJSON()}] >POST /api/v1/transactions`);
    const results = await TransactionsApi.updateTransactions(transactions);
    /* DEBUG */ console.info(`>[${new Date().toJSON()}] >Response: POST /api/v1/transactions |\r\n`, results);

    response.json({data: results,});
  }
  catch (err) {
    /* DEBUG */ console.info(`>[${new Date().toJSON()}] >FAILED: POST /api/v1/transactions |\r\n`, err);
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
    /* DEBUG */ console.info(`>[${new Date().toJSON()}] >POST /api/v1/transactions/:transaction_id`);
    const results = await TransactionsApi.updateTransaction(transactionId, transaction);
    /* DEBUG */ console.info(`>[${new Date().toJSON()}] >Response: POST /api/v1/transactions/:transaction_id |\r\n`, results);

    response.json({data: results,});
  }
  catch (err) {
    /* DEBUG */ console.info(`>[${new Date().toJSON()}] >FAILED: POST /api/v1/transactions/:transaction_id |\r\n`, err);
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

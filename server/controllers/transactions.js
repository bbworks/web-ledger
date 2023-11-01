//Import modules
const util = require('util');
const TransactionsService = require("../services/transactions");


//Define controllers
class TransactionsController {
  constructor() {
    this.service = new TransactionsService();
  }

  async list(request, response) {
    try {
      //Call the getTransactions API
      /* DEBUG */ console.info(`>[${new Date().toJSON()}] >GET /api/v1/transactions`);
      const results = await this.service.getTransactions();
      /* DEBUG */ console.log(`>[${new Date().toJSON()}] >Response: GET /api/v1/transactions |\r\n`);
      /* DEBUG */ console.log(util.inspect(results, {'maxArrayLength': 2, 'depth': null, 'colors': true}));

      return response.json({data: results,});
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

  async get(request, response) {
    const {params: {transaction_id: transactionId}} = request;
    try {
      //Destructure the request object
      
      //Call the getTransaction API
      /* DEBUG */ console.info(`>[${new Date().toJSON()}] >GET /api/v1/transactions/${transactionId}`);
      const results = await this.service.getTransaction(transactionId);
      /* DEBUG */ console.info(`>[${new Date().toJSON()}] >Response: GET /api/v1/transactions/${transactionId} |\r\n`, results);

      return response.json({data: results,});
    }
    catch (err) {
      /* DEBUG */ console.info(`>[${new Date().toJSON()}] >FAILED: GET /api/v1/transactions/${transactionId} |\r\n`, err);
      return response.status(500).json({
        error: err,
      });
    }
  }

  async create(request, response) {
    try {
      //Destructure the request object
      const {body: {transaction}} = request;

      //Call the getTransaction API
      /* DEBUG */ console.info(`>[${new Date().toJSON()}] >POST /api/v1/transactions`);
      const results = await this.service.createTransaction(transaction);
      /* DEBUG */ console.info(`>[${new Date().toJSON()}] >Response: POST /api/v1/transactions |\r\n`, results);

      return response.json({data: results,});
    }
    catch (err) {
      /* DEBUG */ console.info(`>[${new Date().toJSON()}] >FAILED: POST /api/v1/transactions |\r\n`, err);
      return response.status(500).json({
        error: err,
      });
    }
  }

  async save(request, response) {
    try {
      //Destructure the request object
      const {body: {transactions}} = request;

      //Call the updateTransactions API
      /* DEBUG */ console.info(`>[${new Date().toJSON()}] >POST /api/v1/transactions/save`);
      const results = await this.service.updateTransactions(transactions);
      /* DEBUG */ console.info(`>[${new Date().toJSON()}] >Response: POST /api/v1/transactions/save |\r\n`, results);

      return response.json({data: results,});
    }
    catch (err) {
      /* DEBUG */ console.info(`>[${new Date().toJSON()}] >FAILED: POST /api/v1/transactions/save |\r\n`, err);
      return response.status(500).json({
        error: err,
      });
    }
  }

  async update(request, response) {
    const {params: {transaction_id: transactionId}} = request;
    try {
      //Destructure the request object
      const {body: {transaction, updates}} = request;

      //Call the updateTransaction API
      /* DEBUG */ console.info(`>[${new Date().toJSON()}] >PUT /api/v1/transactions/${transactionId}`);
      const results = await this.service.updateTransaction(transactionId, transaction, updates);
      /* DEBUG */ console.info(`>[${new Date().toJSON()}] >Response: PUT /api/v1/transactions/${transactionId} |\r\n`, results);

      return response.json({data: results,});
    }
    catch (err) {
      /* DEBUG */ console.info(`>[${new Date().toJSON()}] >FAILED: PUT /api/v1/transactions/${transactionId} |\r\n`, err);
      return response.status(500).json({
        error: err,
      });
    }
  }

  async destroy(request, response) {
    const {params: {transaction_id: transactionId}} = request;
    try {
      //Call the deleteTransaction API
      /* DEBUG */ console.info(`>[${new Date().toJSON()}] >DELETE /api/v1/transactions/${transactionId}`);
      const results = await this.service.deleteTransaction(transactionId);
      /* DEBUG */ console.info(`>[${new Date().toJSON()}] >Response: DELETE /api/v1/transactions/${transactionId} |\r\n`, results);

      return response.json({data: results,});
    }
    catch (err) {
      /* DEBUG */ console.info(`>[${new Date().toJSON()}] >FAILED: DELETE /api/v1/transactions/${transactionId} |\r\n`, err);
      return response.status(500).json({
        error: err
      });
    }
  }
}

module.exports = TransactionsController;

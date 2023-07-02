//Import modules
const TransactionsApi = require("../api/transactions");
const BudgetsApi = require("../api/budgets");


//Define controllers
const bulk = async (request, response)=>{
  try {
    //Destructure the request object
    const {body: {operations}} = request;

    const resultsArray = await Promise.all(operations.map(async operation=>{
      //Call the appropriate API
      let results;
      try {
        /* DEBUG */ console.info(`>[${new Date().toJSON()}] >POST /api/v1/bulk (${operation.method} ${operation.endpoint})`);
        if (operation.method === "POST" && operation.endpoint === "/api/v1/transactions") {
          results = await TransactionsApi.createTransaction(operation.data.transaction);
        }
        else if (operation.method === "POST" && operation.endpoint === "/api/v1/budgets") {
          results = await BudgetsApi.createBudget(operation.data.budget);
        }
        /* DEBUG */ console.info(`>[${new Date().toJSON()}] >Response: POST /api/v1/bulk (${operation.method} ${operation.endpoint}) |\r\n`, results);
          
          return {
            error: null,
            data: results,
          };
      }
      catch (err) {
        /* DEBUG */ console.error(`>[${new Date().toJSON()}] >ERROR: POST /api/v1/bulk (${operation.method} ${operation.endpoint}) |\r\n`, err);
        return {
          error: err,
          data: null,
        };
      }
    }));
    return response.json({data: resultsArray,});
  }
  catch (err) {
    /* DEBUG */ console.error(`>[${new Date().toJSON()}] >FAILED: POST /api/v1/bulk (POST /api/v1/transactions) |\r\n`, err);
    return response.status(500).json({
      error: err,
    });
  }
}

module.exports = {
  bulk,
}

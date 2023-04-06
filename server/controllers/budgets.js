//Import modules
const BudgetsApi = require("../api/budgets");


//Define controllers
const list = async (request, response) => {
  try {
    //Call the getBudgets API
    const results = await BudgetsApi.getBudgets();

    /* DEBUG */ console.info(`>[${new Date().toJSON()}] >GET /api/v1/budgets`);
    response.json({data: results,});
    /* DEBUG */ console.info(`>[${new Date().toJSON()}] >Response: GET /api/v1/budgets |\r\n`);
  }
  catch (err) {
    /* DEBUG */ console.info(`>[${new Date().toJSON()}] >FAILED: GET /api/v1/budgets |\r\n`, err);
    response.status(500).json({
      error: err,
    });
  }
}

const get = async (request, response)=>{
  try {
    //Destructure the request object
    const {params: {budget_id: budgetId}} = request;

    //Call the getBudget API
    const results = await BudgetsApi.getBudget(budget_id);

    /* DEBUG */ console.info(`>[${new Date().toJSON()}] >GET /api/v1/budgets/:budget_id`);
    response.json({data: results,});
    /* DEBUG */ console.info(`>[${new Date().toJSON()}] >Response: GET /api/v1/budgets/:budget_id |\r\n`);
  }
  catch (err) {
    /* DEBUG */ console.info(`>[${new Date().toJSON()}] >FAILED: GET /api/v1/budgets/:budget_id |\r\n`, err);
    response.status(500).json({
      error: err
    });
  }
}

const create = async (request, response)=>{
//  try {
//    //Destructure the request object
//    const {body: {transaction}} = request;
//
//    //Call the getTransaction API
//    /* DEBUG */ console.info(`>[${new Date().toJSON()}] >POST /api/v1/transactions`);
//    const results = await TransactionsApi.createTransaction(transaction);
//    /* DEBUG */ console.info(`>[${new Date().toJSON()}] >Response: POST /api/v1/transactions |\r\n`, results);
//
//    response.json({data: results,});
//  }
//  catch (err) {
//    /* DEBUG */ console.info(`>[${new Date().toJSON()}] >FAILED: POST /api/v1/transactions |\r\n`, err);
//    return response.status(500).json({
//      error: err,
//    });
//  }
}

const save = async (request, response)=>{
  try {
    //Destructure the request object
    const {body: {budgets}} = request;

    //Call the updateBudgets API
    const results = await BudgetsApi.updateBudgets(budgets);

    /* DEBUG */ console.info(`>[${new Date().toJSON()}] >POST /api/v1/budgets`);
    response.json({data: results,});
    /* DEBUG */ console.info(`>[${new Date().toJSON()}] >Response: POST /api/v1/budgets |\r\n`);
  }
  catch (err) {
    /* DEBUG */ console.info(`>[${new Date().toJSON()}] >FAILED: POST /api/v1/budgets |\r\n`, err);
    response.status(500).json({
      error: err
    });
  }
}

const update = async (request, response)=>{
  try {
    //Destructure the request object
    const {params: {budget_id: budgetId}, body: {budget}} = request;

    //Call the updateBudget API
    /* DEBUG */ console.info(`>[${new Date().toJSON()}] >PUT /api/v1/budgets/:budget_id`);
    const results = await BudgetsApi.updateBudget(budgetId, budget);    console.log("await BudgetsApi.updateBudget(budgetId, budget)");
    /* DEBUG */ console.info(`>[${new Date().toJSON()}] >Response: PUT /api/v1/budgets/:budget_id |\r\n`);
    
    response.json({data: results,});
  }
  catch (err) {
    /* DEBUG */ console.info(`>[${new Date().toJSON()}] >FAILED: PUT /api/v1/budgets/:budget_id |\r\n`, err);
    response.status(500).json({
      error: err
    });
  }
}

const destroy = async (request, response)=>{
//  try {
//    //Destructure the request object
//    const {params: {transaction_id: transactionId}} = request;
//
//    //Call the deleteTransaction API
//    /* DEBUG */ console.info(`>[${new Date().toJSON()}] >DELETE /api/v1/transactions/:transaction_id`);
//    const results = await TransactionsApi.deleteTransaction(transactionId);
//    /* DEBUG */ console.info(`>[${new Date().toJSON()}] >Response: DELETE /api/v1/transactions/:transaction_id |\r\n`, results);
//
//    response.json({data: results,});
//  }
//  catch (err) {
//    /* DEBUG */ console.info(`>[${new Date().toJSON()}] >FAILED: DELETE /api/v1/transactions/:transaction_id |\r\n`, err);
//    return response.status(500).json({
//      error: err,
//    });
//  }
}

module.exports = {
  list,
  get,
  create,
  save,
  update,
  destroy,
}

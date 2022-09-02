//Import modules
const BudgetsApi = require("../api/budgets");


//Define controllers
const get = async (request, response) => {
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

const show = async (request, response)=>{
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
    const results = await BudgetsApi.updateBudget(budgetId, budget);    console.log("await BudgetsApi.updateBudget(budgetId, budget)");

    /* DEBUG */ console.info(`>[${new Date().toJSON()}] >POST /api/v1/budgets/:budget_id`);
    response.json({data: results,});
    /* DEBUG */ console.info(`>[${new Date().toJSON()}] >Response: POST /api/v1/budgets/:budget_id |\r\n`);
  }
  catch (err) {
    /* DEBUG */ console.info(`>[${new Date().toJSON()}] >FAILED: POST /api/v1/budgets/:budget_id |\r\n`, err);
    response.status(500).json({
      error: err
    });
  }
}

module.exports = {
  get,
  show,
  save,
  update,
}

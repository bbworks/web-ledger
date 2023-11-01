//Import modules
const util = require('util');
const BudgetsService = require("../services/budgets");


//Define controllers
class BudgetsController {
  constructor() {
    this.service = new BudgetsService();
  }

  async list(request, response) {
    try {
      //Call the getBudgets API
      /* DEBUG */ console.info(`>[${new Date().toJSON()}] >GET /api/v1/budgets`);
      const results = await this.service.getBudgets();
      /* DEBUG */ console.info(`>[${new Date().toJSON()}] >Response: GET /api/v1/budgets |\r\n`);
      /* DEBUG */ console.log(util.inspect(results, {'maxArrayLength': 2, 'depth': null, 'colors': true}));
      
      response.json({data: results,});
    }
    catch (err) {
      /* DEBUG */ console.info(`>[${new Date().toJSON()}] >FAILED: GET /api/v1/budgets |\r\n`, err);
      return response.status(500).json({
        error: err,
      });
    }
  }

  async get(request, response) {
    const {params: {budget_id: budgetId}} = request;
    try {
      //Destructure the request object

      //Call the getBudget API
      /* DEBUG */ console.info(`>[${new Date().toJSON()}] >GET /api/v1/budgets/${budgetId}`);
      const results = await this.service.getBudget(budgetId);
      /* DEBUG */ console.info(`>[${new Date().toJSON()}] >Response: GET /api/v1/budgets/${budgetId} |\r\n`);

      return response.json({data: results,});
    }
    catch (err) {
      /* DEBUG */ console.info(`>[${new Date().toJSON()}] >FAILED: GET /api/v1/budgets/${budgetId} |\r\n`, err);
      return response.status(500).json({
        error: err
      });
    }
  }

  async create(request, response) {
    try {
      //Destructure the request object
      const {body: {budget}} = request;

      //Call the getBudget API
      /* DEBUG */ console.info(`>[${new Date().toJSON()}] >POST /api/v1/budgets`);
      const results = await this.service.createBudget(budget);
      /* DEBUG */ console.info(`>[${new Date().toJSON()}] >Response: POST /api/v1/budgets |\r\n`, results);

      response.json({data: results,});
    }
    catch (err) {
      /* DEBUG */ console.info(`>[${new Date().toJSON()}] >FAILED: POST /api/v1/budgets |\r\n`, err);
      return response.status(500).json({
        error: err,
      });
    }
  }

  async save(request, response) {
    try {
      //Destructure the request object
      const {body: {budgets}} = request;

      //Call the updateBudgets API
      /* DEBUG */ console.info(`>[${new Date().toJSON()}] >POST /api/v1/budgets`);
      const results = await this.service.updateBudgets(budgets);
      /* DEBUG */ console.info(`>[${new Date().toJSON()}] >Response: POST /api/v1/budgets |\r\n`);

      response.json({data: results,});
    }
    catch (err) {
      /* DEBUG */ console.info(`>[${new Date().toJSON()}] >FAILED: POST /api/v1/budgets |\r\n`, err);
      return response.status(500).json({
        error: err
      });
    }
  }

  async update(request, response) {
    const {params: {budget_id: budgetId}} = request;
    try {
      //Destructure the request object
      const {body: {budget}} = request;

      //Call the updateBudget API
      /* DEBUG */ console.info(`>[${new Date().toJSON()}] >PUT /api/v1/budgets/${budgetId}`);
      const results = await this.service.updateBudget(budgetId, budget);    console.log("await this.service.updateBudget(budgetId, budget)");
      /* DEBUG */ console.info(`>[${new Date().toJSON()}] >Response: PUT /api/v1/budgets/${budgetId} |\r\n`);
      
      return response.json({data: results,});
    }
    catch (err) {
      /* DEBUG */ console.info(`>[${new Date().toJSON()}] >FAILED: PUT /api/v1/budgets/${budgetId} |\r\n`, err);
      return response.status(500).json({
        error: err
      });
    }
  }

  async destroy(request, response) {
    const {params: {budget_id: budgetId}} = request;
    try {
      //Call the deleteTransaction API
      /* DEBUG */ console.info(`>[${new Date().toJSON()}] >DELETE /api/v1/transactions/${budgetId}`);
      const results = await this.service.deleteTransaction(transactionId);
      /* DEBUG */ console.info(`>[${new Date().toJSON()}] >Response: DELETE /api/v1/transactions/${budgetId} |\r\n`, results);

      return response.json({data: results,});
    }
    catch (err) {
      /* DEBUG */ console.info(`>[${new Date().toJSON()}] >FAILED: DELETE /api/v1/transactions/${budgetId} |\r\n`, err);
      return response.status(500).json({
        error: err,
      });
    }
  }
}

module.exports = BudgetsController;

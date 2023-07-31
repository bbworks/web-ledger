//Import modules
const express = require("express");
const BudgetsController = require("../controllers/budgets");


//Define routes
class BudgetsRouter {
  constructor() {
    this.router = express.Router();

    this.router.get("/", BudgetsController.list);

    this.router.get("/:budget_id", BudgetsController.get);

    this.router.post("/", BudgetsController.create);

    this.router.post("/", BudgetsController.save);

    this.router.put("/:budget_id", BudgetsController.update);

    this.router.delete("/:budget_id", BudgetsController.destroy);
  }
}

//Export the router
module.exports = BudgetsRouter;

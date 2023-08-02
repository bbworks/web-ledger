//Import modules
const express = require("express");
const BudgetsController = require("../controllers/budgets");


//Define routes
class BudgetsRouter {
  constructor() {
    this.router = express.Router();
    this.controller = new BudgetsController();

    this.router.get("/", this.controller.list.bind(this.controller));
    this.router.get("/:budget_id", this.controller.get.bind(this.controller));
    this.router.post("/", this.controller.create.bind(this.controller));
    this.router.post("/", this.controller.save.bind(this.controller));
    this.router.put("/:budget_id", this.controller.update.bind(this.controller));
    this.router.delete("/:budget_id", this.controller.destroy.bind(this.controller));
  }
}

//Export the router
module.exports = BudgetsRouter;

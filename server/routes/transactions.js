//Import modules
const express = require("express");
const TransactionsController = require("../controllers/transactions");


//Define routes
class TransactionsRouter {
  constructor() {
    this.router = express.Router();
    this.controller = new TransactionsController();

    this.router.get("/", this.controller.list.bind(this.controller));
    this.router.get("/:transaction_id", this.controller.get.bind(this.controller));
    this.router.post("/", this.controller.create.bind(this.controller));
    this.router.post("/save", this.controller.save.bind(this.controller));
    this.router.put("/:transaction_id", this.controller.update.bind(this.controller));
    this.router.delete("/:transaction_id", this.controller.destroy.bind(this.controller));
  }
}

//Export the router
module.exports = TransactionsRouter;

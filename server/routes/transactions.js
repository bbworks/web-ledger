//Import modules
const express = require("express");
const TransactionsController = require("../controllers/transactions");


//Define routes
class TransactionsRouter {
  constructor() {
    this.router = express.Router();

    this.router.get("/", TransactionsController.list);

    this.router.get("/:transaction_id", TransactionsController.get);

    this.router.post("/", TransactionsController.create);

    this.router.post("/save", TransactionsController.save);

    this.router.put("/:transaction_id", TransactionsController.update);

    this.router.delete("/:transaction_id", TransactionsController.destroy);
  }
}

//Export the router
module.exports = TransactionsRouter;

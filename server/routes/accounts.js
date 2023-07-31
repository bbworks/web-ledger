//Import modules
const express = require("express");
const AccountsController = require("../controllers/accounts");


//Define routes
class AccountsRouter {
  constructor() {
    this.router = express.Router();

    this.router.get("/", AccountsController.get);

    this.router.get("/:account_id", AccountsController.show);

    this.router.post("/", AccountsController.save);

    this.router.post("/:account_id", AccountsController.update);
  }
}

//Export the router
module.exports = AccountsRouter;

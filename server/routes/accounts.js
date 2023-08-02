//Import modules
const express = require("express");
const AccountsController = require("../controllers/accounts");


//Define routes
class AccountsRouter {
  constructor() {
    this.router = express.Router();
    this.controller = new AccountsController();

    this.router.get("/", this.controller.get.bind(this.controller));
    this.router.get("/:account_id", this.controller.show.bind(this.controller));
    this.router.post("/", this.controller.save.bind(this.controller));
    this.router.post("/:account_id", this.controller.update.bind(this.controller));
  }
}

//Export the router
module.exports = AccountsRouter;

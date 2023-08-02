//Import modules
const express = require("express");
const AccountController = require("../controllers/account");


//Define routes
class AccountRouter {
  constructor() {
    this.router = express.Router();
    this.controller = new AccountController();

    this.router.get("/:account_id", this.controller.get.bind(this.controller));
  }
}

//Export the router
module.exports = AccountRouter;

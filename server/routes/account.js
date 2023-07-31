//Import modules
const express = require("express");
const AccountController = require("../controllers/account");


//Define routes
class AccountRouter {
  constructor() {
    this.router = express.Router();

    this.router.get("/:account_id", AccountController.get);
  }
}

//Export the router
module.exports = AccountRouter;

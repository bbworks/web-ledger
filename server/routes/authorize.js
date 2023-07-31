//Import modules
const express = require("express");
const AuthController = require("../controllers/authorize");


//Define routes
class AuthRouter {
  constructor() {
    this.router = express.Router();

    this.router.get("/", AuthController.authorize);

    this.router.post("/login", AuthController.login);

    this.router.get("/oauth2callback", AuthController.callback);
  }
}

//Export the router
module.exports = AuthRouter;

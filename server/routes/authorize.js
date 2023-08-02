//Import modules
const express = require("express");
const AuthController = require("../controllers/authorize");


//Define routes
class AuthRouter {
  constructor() {
    this.router = express.Router();
    this.controller = new AuthController();

    this.router.get("/", this.controller.authorize.bind(this.controller));
    this.router.post("/login", this.controller.login.bind(this.controller));
    this.router.get("/oauth2callback", this.controller.callback.bind(this.controller));
  }
}

//Export the router
module.exports = AuthRouter;

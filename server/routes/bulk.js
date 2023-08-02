//Import modules
const express = require("express");
const BulkController = require("../controllers/bulk");


//Define routes
class BulkRouter {
  constructor() {
    this.router = express.Router();
    this.controller = new BulkController();
    
    this.router.post("/", this.controller.bulk.bind(this.controller));
  }
}

//Export the router
module.exports = BulkRouter;

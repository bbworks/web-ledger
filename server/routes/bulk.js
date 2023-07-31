//Import modules
const express = require("express");
const BulkController = require("../controllers/bulk");


//Define routes
class BulkRouter {
  constructor() {
    this.router = express.Router();
    
    this.router.post("/", BulkController.bulk);
  }
}

//Export the router
module.exports = BulkRouter;

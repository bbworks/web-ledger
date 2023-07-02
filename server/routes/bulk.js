//Import modules
const router = require("express").Router();
const BulkController = require("../controllers/bulk");


//Define routes
router.post("/", BulkController.bulk);

//Export the router
module.exports = router;

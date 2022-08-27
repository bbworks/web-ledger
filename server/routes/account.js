//Import modules
const router = require("express").Router();
const AccountController = require("../controllers/accounts");


//Define routes
router.get("/:account_id", AccountController.get);

//Export the router
module.exports = router;

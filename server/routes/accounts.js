//Import modules
const router = require("express").Router();
const AccountsController = require("../controllers/accounts");


//Define routes
router.get("/", AccountsController.get);

router.get("/:account_id", AccountsController.show);

router.post("/", AccountsController.save);

router.post("/:account_id", AccountsController.update);

//Export the router
module.exports = router;

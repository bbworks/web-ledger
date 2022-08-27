//Import modules
const router = require("express").Router();
const TransactionsController = require("../controllers/transactions");


//Define routes
router.get("/", TransactionsController.get);

router.get("/:transaction_id", TransactionsController.show);

router.post("/", TransactionsController.save);

router.post("/:transaction_id", TransactionsController.update);

//Export the router
module.exports = router;

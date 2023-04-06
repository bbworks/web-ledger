//Import modules
const router = require("express").Router();
const TransactionsController = require("../controllers/transactions");


//Define routes
router.get("/", TransactionsController.list);

router.get("/:transaction_id", TransactionsController.get);

router.post("/", TransactionsController.create);

router.post("/save", TransactionsController.save);

router.put("/:transaction_id", TransactionsController.update);

router.delete("/:transaction_id", TransactionsController.destroy);

//Export the router
module.exports = router;

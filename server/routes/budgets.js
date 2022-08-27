//Import modules
const router = require("express").Router();
const BudgetsController = require("../controllers/budgets");


//Define routes
router.get("/", BudgetsController.get);

router.get("/:budget_id", BudgetsController.show);

router.post("/", BudgetsController.save);

router.post("/:budget_id", BudgetsController.update);

//Export the router
module.exports = router;

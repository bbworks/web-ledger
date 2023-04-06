//Import modules
const router = require("express").Router();
const BudgetsController = require("../controllers/budgets");


//Define routes
router.get("/", BudgetsController.list);

router.get("/:budget_id", BudgetsController.get);

router.post("/", BudgetsController.create);

router.post("/", BudgetsController.save);

router.put("/:budget_id", BudgetsController.update);

router.delete("/:budget_id", BudgetsController.destroy);

//Export the router
module.exports = router;

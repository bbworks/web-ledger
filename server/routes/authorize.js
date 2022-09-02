//Import modules
const router = require("express").Router();
const AuthController = require("../controllers/authorize");


//Define routes
router.get("/", AuthController.authorize);

router.post("/login", AuthController.login);

router.get("/oauth2callback", AuthController.callback);

//Export the router
module.exports = router;

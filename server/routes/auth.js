//Import modules
const router = require("express").Router();
const AuthController = require("../controllers/auth");


//Define routes
router.post("/", AuthController.post);

//Export the router
module.exports = router;

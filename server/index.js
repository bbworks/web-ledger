//Import modules
const Server = require("./server");
const dotenv = require("dotenv");


//Import dotenv config
dotenv.config();


//Create & start the server
const server = new Server();
server.start();

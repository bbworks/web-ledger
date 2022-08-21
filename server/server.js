//Import modules
const express = require("express");
const path = require("path");


class Server {
  constructor() {
    //Declare properties
    this.server = express();
    this.port = process.env.PORT;

    //Set up server middleware
    this.initMiddleware();

    //Set up application routes
    this.initRoutes();
  }

  initMiddleware() {
    // NOTE: "Middleware" are processes called BETWEEN
    //  request processing & response sending; this can include
    //  libraries for extending Express's functionality and
    //  establishing routers to use for certain routes
    this.server.use(express.json());
    this.server.use(express.urlencoded({ extended: true }));
  }

  initRoutes() {
    //Set up 404 handling and forward to error handler
    // (HTTP 404 does not constitute an error)
    this.server.use((req, res, next) => {
      res.status(404).send("404 Not Found");
    });

    //Set up error handling route
    this.server.use((err, req, res, next) => {
      //"So when you add a custom error handler,
      // you must delegate to the default Express error handler,
      // when the headers have already been sent to the client"
      //  http://expressjs.com/en/guide/error-handling.html
      if (res.headersSent) {
        return next(err)
      }

      console.error(err);
      res.status(err.status || 500).send('Error');
    });
  }

  listen() {
    const port = this.port;
    //Start the http server
    this.server.listen(port, ()=>console.log(`Server running on port ${port}.`));
  }
}

module.exports = Server;

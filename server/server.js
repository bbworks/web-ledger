//Import modules
const express = require("express");
const path = require("path");
const cors = require("cors");

const TransactionsRouter = require("./routes/transactions")
const BudgetsRouter = require("./routes/budgets")
const AccountsRouter = require("./routes/accounts")
const AccountRouter = require("./routes/account")
const AuthRouter = require("./routes/authorize")

class Server {
  constructor() {
    //Declare properties
    this.server = express();
    this.port = process.env.PORT;
    this.basePath = "/api/v1"
    this.paths = {
      transactions: `${this.basePath}/transactions`,
      budgets: `${this.basePath}/budgets`,
      accounts: `${this.basePath}/accounts`,
      account: `${this.basePath}/account`,
      authorize: `${this.basePath}/authorize`,
    };

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
    this.server.use(cors());
  }

  initRoutes() {
    //Set up server routes
    this.server.use(this.paths.transactions, TransactionsRouter);
    this.server.use(this.paths.budgets, BudgetsRouter);
    this.server.use(this.paths.accounts, AccountsRouter);
    this.server.use(this.paths.account, AccountRouter);
    this.server.use(this.paths.authorize, AuthRouter);

    //Set up 404 handling and forward to error handler
    // (HTTP 404 does not constitute an error)
    this.server.use((req, res, next) => {
      /* DEBUG */ console.info(`>[${new Date().toJSON()}] >404 ${req.method} ${req.originalUrl}`);
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

//Import modules
const express = require("express");
const cors = require("cors");

//Import routers
const TransactionsRouter = require("./routes/transactions");
const BudgetsRouter = require("./routes/budgets");
const AccountsRouter = require("./routes/accounts");
const AccountRouter = require("./routes/account");
const AuthRouter = require("./routes/authorize");
const BulkRouter = require("./routes/bulk");


class Server {
  constructor(port = process.env.PORT) {
    //Declare properties
    this.app = express();
    this.port = port;
    this.basePath = "/api/v1"
    this.paths = {
      transactions: `${this.basePath}/transactions`,
      budgets: `${this.basePath}/budgets`,
      accounts: `${this.basePath}/accounts`,
      account: `${this.basePath}/account`,
      authorize: `${this.basePath}/authorize`,
      bulk: `${this.basePath}/bulk`,
    };

    //Set up server middleware
    this.initMiddleware();

    //Set up application routes
    this.initRoutes();

    //Set up application error handling
    this.initErrorHandling();
  }

  initMiddleware() {
    // NOTE: "Middleware" are processes called BETWEEN
    //  request processing & response sending; this can include
    //  libraries for extending Express's functionality and
    //  establishing routers to use for certain routes
    this.app.use(express.json());
    this.app.use(express.urlencoded({ extended: true }));
    this.app.use(cors());
  }

  initRoutes() {
    //Set up server routes
    this.app.use(this.paths.transactions, new TransactionsRouter().router);
    this.app.use(this.paths.budgets, new BudgetsRouter().router);
    this.app.use(this.paths.accounts, new AccountsRouter().router);
    this.app.use(this.paths.account, new AccountRouter().router);
    this.app.use(this.paths.authorize, new AuthRouter().router);
    this.app.use(this.paths.bulk, new BulkRouter().router);
  }

  initErrorHandling() {
    //Set up 404 handling and forward to error handler
    // (HTTP 404 does not constitute an error)
    this.app.use((req, res, next) => {
      /* DEBUG */ console.error(`>[${new Date().toJSON()}] >404 ${req.method} ${req.originalUrl}`);
      res.status(404).json({
        error: "404 Not Found",
      });
    });

    //Set up global error handling
    this.app.use((err, req, res, next) => {
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

  start() {
    //Start the http server
    this.app.listen(this.port, ()=>console.log(`Server running on port ${this.port}.`));
  }
}

module.exports = Server;

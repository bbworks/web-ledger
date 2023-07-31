//Import modules
const AccountsApi = require("../api/accounts");


//Define controllers
class AccountsController {
  static async get(request, response) {
    try {
      //Call the getAccounts API
      /* DEBUG */ console.info(`>[${new Date().toJSON()}] >GET /api/v1/accounts/`);
      const results = await AccountsApi.getAccounts();
      /* DEBUG */ console.info(`>[${new Date().toJSON()}] >Response: GET /api/v1/accounts/ |\r\n`, results);

      response.json({data: results,});
    }
    catch (err) {
      /* DEBUG */ console.info(`>[${new Date().toJSON()}] >FAILED: GET /api/v1/accounts/ |\r\n`, err);
      response.status(500).json({
        error: err,
      });
    }
  }

  static async show(request, response) {
    try {
      //Destructure the request object
      const {params: {account_id: accountId}} = request;

      //Call the getAccount API
      /* DEBUG */ console.info(`>[${new Date().toJSON()}] >GET /api/v1/accounts/:account_id`);
      const results = await AccountsApi.getAccount(account_id);
      /* DEBUG */ console.info(`>[${new Date().toJSON()}] >Response: GET /api/v1/accounts/:account_id |\r\n`, results);

      response.json({data: results,});
    }
    catch (err) {
      /* DEBUG */ console.info(`>[${new Date().toJSON()}] >FAILED: GET /api/v1/accounts/:account_id |\r\n`, err);
      response.status(500).json({
        error: err,
      });
    }
  }

  static async save(request, response) {
    try {
      //Destructure the request object
      const {body: {accounts}} = request;

      //Call the updateAccounts API
      /* DEBUG */ console.info(`>[${new Date().toJSON()}] >POST /api/v1/accounts/`);
      const results = await AccountsApi.updateAccounts(accounts);
      /* DEBUG */ console.info(`>[${new Date().toJSON()}] >Response: POST /api/v1/accounts/ |\r\n`, results);

      response.json({data: results,});
    }
    catch (err) {
      /* DEBUG */ console.info(`>[${new Date().toJSON()}] >FAILED: POST /api/v1/accounts/ |\r\n`, err);
      response.status(500).json({
        error: err,
      });
    }
  }

  static async update(request, response) {
    try {
      //Destructure the request object
      const {params: {account_id: accountId}, body: {account}} = request;

      //Call the updateAccount API
      /* DEBUG */ console.info(`>[${new Date().toJSON()}] >POST /api/v1/accounts/:account_id`);
      const results = await AccountsApi.updateAccount(accountId, account);
      /* DEBUG */ console.info(`>[${new Date().toJSON()}] >Response: POST /api/v1/accounts/:account_id |\r\n`, results);

      response.json({data: results,});
    }
    catch (err) {
      /* DEBUG */ console.info(`>[${new Date().toJSON()}] >FAILED: POST /api/v1/accounts/:account_id |\r\n`, err);
      response.status(500).json({
        error: err,
      });
    }
  }
}

module.exports = AccountsController;

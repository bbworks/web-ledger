//Import modules
const AccountService = require("../services/account");


//Define controllers
class AccountController {
  constructor() {
    this.service = new AccountService();
  }

  async get(request, response) {
    try {
      //Destructure the request object
      const {params: {account_id: accountId}} = request;

      //Call the getAccounts API
      /* DEBUG */ console.info(`>[${new Date().toJSON()}] >GET /api/v1/account/:account_id`);
      const results = await this.service.getAccount(accountId);
      /* DEBUG */ console.info(`>[${new Date().toJSON()}] >Response: GET /api/v1/account/:account_id |\r\n`, results);

      response.json({data: results,});
    }
    catch (err) {
      /* DEBUG */ console.info(`>[${new Date().toJSON()}] >FAILED: GET /api/v1/account/:account_id |\r\n`, err);
      response.status(500).json({
        error: err,
      });
    }
  }
}

module.exports = AccountController;

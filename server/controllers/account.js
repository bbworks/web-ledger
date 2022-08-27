//Import modules
const AccountApi = require("../api/account");


//Define controllers
const get = async (request, response) => {
  try {
    //Destructure the request object
    const {params: {account_id: accountId}} = request;

    //Call the getAccounts API
    const results = await AccountApi.getAccount(accountId);

    /* DEBUG */ console.info(`>[${new Date().toJSON()}] >GET /api/v1/account/:account_id`);
    response.json({data: results,});
    /* DEBUG */ console.info(`>[${new Date().toJSON()}] >Response: GET /api/v1/account/:account_id |\r\n`);
  }
  catch (err) {
    /* DEBUG */ console.info(`>[${new Date().toJSON()}] >FAILED: GET /api/v1/account/:account_id |\r\n`, err);
    response.status(500).json({
      error: err,
    });
  }
}

module.exports = {
  get,
}

//Import modules
const AccountsApi = require("../api/accounts");


//Define controllers
const get = async (request, response) => {
  try {
    //Call the getAccounts API
    const results = await AccountsApi.getAccounts();

    /* DEBUG */ console.info(`>[${new Date().toJSON()}] >GET /api/v1/accounts/`);
    response.json(results);
    /* DEBUG */ console.info(`>[${new Date().toJSON()}] >Response: GET /api/v1/accounts/ |\r\n`);
  }
  catch (err) {
    /* DEBUG */ console.info(`>[${new Date().toJSON()}] >FAILED: GET /api/v1/accounts/ |\r\n`, err);
    response.status(500).json({
      error: err,
    });
  }
}

const show = async (request, response)=>{
  try {
    //Destructure the request object
    const {params: {account_id: accountId}} = request;

    //Call the getAccount API
    const results = await AccountsApi.getAccount(account_id);

    /* DEBUG */ console.info(`>[${new Date().toJSON()}] >GET /api/v1/accounts/:account_id`);
    response.json({data: results,});
    /* DEBUG */ console.info(`>[${new Date().toJSON()}] >Response: GET /api/v1/accounts/:account_id |\r\n`);
  }
  catch (err) {
    /* DEBUG */ console.info(`>[${new Date().toJSON()}] >FAILED: GET /api/v1/accounts/:account_id |\r\n`, err);
    response.status(500).json({
      error: err,
    });
  }
}

const save = async (request, response)=>{
  try {
    //Destructure the request object
    const {body: {accounts}} = request;

    //Call the updateAccounts API
    const results = await AccountsApi.updateAccounts(accounts);

    /* DEBUG */ console.info(`>[${new Date().toJSON()}] >POST /api/v1/accounts/`);
    response.json({data: results,});
    /* DEBUG */ console.info(`>[${new Date().toJSON()}] >Response: POST /api/v1/accounts/ |\r\n`);
  }
  catch (err) {
    /* DEBUG */ console.info(`>[${new Date().toJSON()}] >FAILED: POST /api/v1/accounts/ |\r\n`, err);
    response.status(500).json({
      error: err,
    });
  }
}

const update = async (request, response)=>{
  try {
    //Destructure the request object
    const {params: {account_id: accountId}, body: {account}} = request;

    //Call the updateAccount API
    const results = await AccountsApi.updateAccount(accountId, account);

    /* DEBUG */ console.info(`>[${new Date().toJSON()}] >POST /api/v1/accounts/:account_id`);
    response.json({data: results,});
    /* DEBUG */ console.info(`>[${new Date().toJSON()}] >Response: POST /api/v1/accounts/:account_id |\r\n`);
  }
  catch (err) {
    /* DEBUG */ console.info(`>[${new Date().toJSON()}] >FAILED: POST /api/v1/accounts/:account_id |\r\n`, err);
    response.status(500).json({
      error: err,
    });
  }
}

module.exports = {
  get,
  show,
  save,
  update,
}

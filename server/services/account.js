const {getSheetsSpreadsheetValues, updateSheetsSpreadsheetValues} = require("../googleApi/gapi");

class AccountService {
    async getAccount(accountId) {
    return await getSheetsSpreadsheetValues("Account Data");
  };
}

module.exports = AccountService;

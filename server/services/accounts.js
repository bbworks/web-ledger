const {getSheetsSpreadsheetValues, updateSheetsSpreadsheetValues} = require("../googleApi/gapi");

class AcountsService {
    async getAccounts() {
    return await getSheetsSpreadsheetValues("Accounts Data");
  }
}

module.exports = AcountsService;

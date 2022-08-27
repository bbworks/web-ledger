const {getSheetsSpreadsheetValues, updateSheetsSpreadsheetValues} = require("./../googleApi/gapi");

const getAccounts = async ()=>{
  return await getSheetsSpreadsheetValues("Accounts Data");
}

module.exports = {
  getAccounts,
};

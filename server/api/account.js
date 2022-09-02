const {getSheetsSpreadsheetValues, updateSheetsSpreadsheetValues} = require("./../googleApi/gapi");

const getAccount = async (accountId)=>{
  return await getSheetsSpreadsheetValues("Account Data");
};

module.exports = {
  getAccount,
};

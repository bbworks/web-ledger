const {getSheetsSpreadsheetValues, updateSheetsSpreadsheetValues} = require("./../googleApi/gapi");

const getAccount = async ()=>{
  return await getSheetsSpreadsheetValues("Account Data");
};

module.exports = {
  getAccount,
};

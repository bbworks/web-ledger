const {getSheetsSpreadsheetValues, updateSheetsSpreadsheetValues} = require("./../googleApi/gapi");

const getTransactions = async ()=>{
  return await getSheetsSpreadsheetValues("Transactions Data");
};

const updateTransactions = async transactions=>{
  return await updateSheetsSpreadsheetValues("Transactions Data", transactions);
};

module.exports = {
  getTransactions,
  updateTransactions,
};

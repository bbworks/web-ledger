const {getSheetsSpreadsheetValues, updateSheetsSpreadsheetValues} = require("./../googleApi/gapi");

const getBudgets = async ()=>{
  return await getSheetsSpreadsheetValues("Budgets Data");
};

const updateBudgets = async budgets=>{
  return await updateSheetsSpreadsheetValues("Budgets Data", budgets);
};

module.exports = {
  getBudgets,
  updateBudgets,
};

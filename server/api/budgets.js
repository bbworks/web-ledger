const {getSheetsSpreadsheetValues, updateSheetsSpreadsheetValues} = require("./../googleApi/gapi");
const db = require("./../db");
const mysql = require('mysql2');

const getBudgets = async ()=>{
  // return await getSheetsSpreadsheetValues("Budgets Data");
  try {
    const sql = `SELECT * FROM vwBudget;`

    const [results] = await db.execute(sql);
    console.log("SQL:", mysql.format(sql));
    // console.log("results", results);
    return results;
  }
  catch (err) {
    throw err;
  }
};

const updateBudgets = async budgets=>{
  return await updateSheetsSpreadsheetValues("Budgets Data", budgets);
};

module.exports = {
  getBudgets,
  updateBudgets,
};

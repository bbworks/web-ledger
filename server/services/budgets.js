const {getSheetsSpreadsheetValues, updateSheetsSpreadsheetValues} = require("../googleApi/gapi");
const db = require("../db");
const mysql = require('mysql2');

class BudgetsService {
  async getBudgets() {
    try {
      const sql = `SELECT * FROM vwBudget;`

      console.log("SQL:", mysql.format(sql));
      
      const [results] = await db.execute(sql);
      
      // console.log("results", results);
      
      return results;
    }
    catch (err) {
      throw err;
    }
  };

  async getBudget(budgetId) {
    try {
      const sql = `SELECT * FROM vwBudget WHERE BudgetId = ?;`;

      const values = [budgetId];
      
      console.log("budgetId:", budgetId);
      console.log("SQL:", mysql.format(sql, values));

      const [results] = await db.query(sql, values);
      const [budget] = results;
      
      console.log("results", results);
      
      return budget;
    }
    catch (err) {
      throw err;
    }
  };

  async updateBudgets(budgets) {
    return await updateSheetsSpreadsheetValues("Budgets Data", budgets);
  };

  async createBudget(budget) {
    try {
      const sql = `CALL CreateBudget (
      /* $Name = */ ?
    , /* $Amount = */ ?
    , /* $Type = */ ?
    , /* $BudgetGroup = */ ?
    , /* $BudgetCycle = */ ?
    , /* $DueDate = */ ?
    , /* $IsPaidByCreditCardNotAccount = */ ?
    , /* $Color = */ ?
    , /* $date_created = */ ?
    , /* $created_by = */ ?
    , /* $date_modified = */ ?
    , /* $modified_by = */ ?
    , /* $UserId = */ ?
  );`;

      const values = [
        budget.Name,
        budget.Amount,
        budget.Type,
        budget.Group, /* BudgetGroup */
        new Date(budget.BudgetCycle),
        !budget.DueDate ? null : budget.DueDate,
        Boolean(budget.IsPaidByCreditCardNotAccount),
        budget.Color,
        new Date(budget.date_created),
        budget.created_by,
        new Date(budget.date_modified),
        budget.modified_by,
        budget.UserId,
      ];
      
      console.log("budget:", budget);
      console.log("SQL:", mysql.format(sql, values));

      const [results] = await db.query(sql, values);
      const lastInsertId = results[0][0]["LAST_INSERT_ID()"];
      
      console.log("results", results);
      console.log("LAST_INSERT_ID()", lastInsertId);
      
      const newBudget = await this.getBudget(lastInsertId);
      
      console.log("newBudget", newBudget);
      
      return newBudget;
    }
    catch (err) {
      throw err;
    }
  };
}

module.exports = BudgetsService;

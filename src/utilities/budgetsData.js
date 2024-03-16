import {getSumByProp} from './utilities.js';
import {isBudgetedIncomeTransaction} from './transactions.js';
import {parseGoogleSheetsNumber, parseGoogleSheetsDate} from './../googleApi';

export const isCreditCardPaymentTransaction = transaction=>{
  return transaction.Description.match(/PAYMENT - THANK YOU ATLANTA GA/i);
};

export const getBudgetTransactions = (budgetName, transactions)=>{
  return transactions.filter(transaction=>(
    //For non-income & non-payment transactions with no budget, mark as Miscellaneous budget
    budgetName === "Miscellaneous" ?
    [budgetName, null].includes(transaction.Budget) && !isCreditCardPaymentTransaction(transaction) && !isBudgetedIncomeTransaction(transaction) :
    transaction.Budget === budgetName
  ));
};

export const getBudgetAmountSpentFromTransactions = (budgetName, transactions)=>{
  return getSumByProp(getBudgetTransactions(budgetName, transactions), "Amount");
};

export const typeCheckBudgetsData = budgetsData=>{
  return budgetsData.map(budgetData=>({
      ...budgetData,
      BudgetId: parseGoogleSheetsNumber(budgetData.BudgetId),
      Amount: parseGoogleSheetsNumber(budgetData.Amount),
      BudgetCycle: parseGoogleSheetsDate(budgetData.BudgetCycle),
      DateCreated: parseGoogleSheetsDate(budgetData.DateCreated),
      DateModified: parseGoogleSheetsDate(budgetData.DateModified),
    })
  );
};

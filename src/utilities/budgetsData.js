import {getSumByProp} from './utilities.js';

export const isCreditCardPaymentTransaction = transaction=>{
  return transaction.Description.match(/PAYMENT - THANK YOU ATLANTA GA/i);
};

export const isIncomeTransaction = transaction=>{
  return transaction.Description.match(/ELECTRONIC\/ACH CREDIT INFOR US , INC\. PAYROLL 3203469219/i);
};

export const getBudgetAmountSpentFromTransactions = (budgetName, transactions)=>{
  const check = transaction=>{
    return (
      //For the Miscellaneous budget, include non-income transactions with no category
      budgetName === "Miscellaneous" ?
      [budgetName, null].includes(transaction.Category) && !isCreditCardPaymentTransaction(transaction) && !isIncomeTransaction(transaction) :
      transaction.Category === budgetName
    )
  };
  return getSumByProp(transactions.filter(transaction=>check(transaction)), "Amount");
};
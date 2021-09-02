import {useState, useEffect} from 'react';

import {getBudgetCycleFromDate} from './../utilities';

const useBudgetCycleTransactions = (transactions, budgetCycle)=>{
  //Declare functions
  const getLastBudgetCycleIncomeTransactions = (transactions, budgetCycle)=>{
    //Get income transactions from last budget cycle
    if (!transactions.length || !budgetCycle) return [];

    return transactions.filter(transaction=>["Infor payroll", "Other income"].includes(transaction.Category));
  };

  const getCurrentBudgetCycleIncomeTransactions = (transactions, budgetCycle)=>{
    //Get other income transactions from this budget cycle
    if (!transactions.length || !budgetCycle) return [];

    return transactions.filter(transaction=>!["Infor payroll", "Other income"].includes(transaction.Category) && transaction.Amount >= 0 && !transaction.Description.match(/CREDIT CARD PAYMENT (?:MOBILE APP PAYMENT|ONLINE BANKING TRANSFER) TO \d{4} \d{6}\*{6}(\d{4})/i) && !transaction.Description.match(/PAYMENT - \w{5} \w{3} \w{7} \w{2}/i));
  };

  const getCurrentBudgetCycleExpenseTransactions = (transactions, budgetCycle)=>{
    //Get expense transactions from this budget cycle
    if (!transactions.length || !budgetCycle) return [];

    return transactions.filter(transaction=>!["Infor payroll", "Other income"].includes(transaction.Category) && transaction.Amount < 0 && !transaction.Description.match(/CREDIT CARD PAYMENT (?:MOBILE APP PAYMENT|ONLINE BANKING TRANSFER) TO \d{4} \d{6}\*{6}(\d{4})/i) && !transaction.Description.match(/PAYMENT - \w{5} \w{3} \w{7} \w{2}/i));
  };

  const getBudgetCycleTransactions = (transactions, budgetCycle)=>{
    //Get transactions marked with this budgetCycle
    // (or with a Date of this budget cycle, if no BudgetCycle)
    const currentBudgetCycleTransactions = transactions.filter(transaction=>
      //Transactions with this budget cycle
      getBudgetCycleFromDate(transaction.BudgetCycle || transaction.TransactionDate).getTime() === budgetCycle.getTime()
      &&
      //Remove payment transactions
      !(transaction.Type === "Payment")
    );

    //Get last budget cycle's income
    const lastBudgetCycleIncomeTransactions = getLastBudgetCycleIncomeTransactions(currentBudgetCycleTransactions, budgetCycle);

    //Get this budget cycle's other income
    const currentBudgetCycleIncomeTransactions = getCurrentBudgetCycleIncomeTransactions(currentBudgetCycleTransactions, budgetCycle);

    //Get this month's transactions (minus income)
    const currentBudgetCycleExpenseTransactions = getCurrentBudgetCycleExpenseTransactions(currentBudgetCycleTransactions, budgetCycle);

    console.log({income: [...lastBudgetCycleIncomeTransactions, ...currentBudgetCycleIncomeTransactions], expenses: currentBudgetCycleExpenseTransactions, all: currentBudgetCycleTransactions})
    return {
      income: [...lastBudgetCycleIncomeTransactions, ...currentBudgetCycleIncomeTransactions],
      expenses: currentBudgetCycleExpenseTransactions,
      get all() {return [...this.income, ...this.expenses].flat()},
    };
  };

  //Initialize state
  const [budgetCycleTransactions, setBudgetCycleTransactions] = useState(getBudgetCycleTransactions(transactions, budgetCycle));

  //Whenever transactions or budgetCycle changes,
  // update state
  useEffect(()=>
    setBudgetCycleTransactions(getBudgetCycleTransactions(transactions, budgetCycle))
  , [transactions, budgetCycle]);

  //Return the state
  return budgetCycleTransactions;
};

export default useBudgetCycleTransactions;

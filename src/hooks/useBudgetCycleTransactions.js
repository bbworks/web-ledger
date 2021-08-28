import {useState, useEffect} from 'react';

const useBudgetCycleTransactions = (transactions, budgetCycle)=>{
  //Declare functions
  const getLastBudgetCycleIncomeTransactions = (transactions, budgetCycle)=>{
    if (!transactions.length || !budgetCycle) return [];

    const lastBudgetCycleMonth = ((budgetCycle.getMonth() - 1 + 12) % 12); //last month, looping over 12
    const lastBudgetCycleYear = (budgetCycle.getMonth() -1 < 0 ? budgetCycle.getFullYear() - 1 : budgetCycle.getFullYear());

    return transactions
      .filter(({TransactionDate})=>TransactionDate.getMonth() === lastBudgetCycleMonth && TransactionDate.getFullYear() === lastBudgetCycleYear)
      .filter(({Category})=>["Infor payroll", "Other income"].includes(Category));
  };

  const getCurrentBudgetCycleIncomeTransactions = (transactions, budgetCycle)=>{
    if (!transactions.length || !budgetCycle) return [];

    return transactions
      .filter(({TransactionDate})=>TransactionDate.getMonth() === budgetCycle.getMonth() && TransactionDate.getFullYear() === budgetCycle.getFullYear())
      .filter(transaction=>!["Infor payroll", "Other income"].includes(transaction.Category) && transaction.Amount >= 0 && !transaction.Description.match(/CREDIT CARD PAYMENT (?:MOBILE APP PAYMENT|ONLINE BANKING TRANSFER) TO \d{4} \d{6}\*{6}(\d{4})/i) && !transaction.Description.match(/PAYMENT - \w{5} \w{3} \w{7} \w{2}/i));
  };

  const getCurrentBudgetCycleExpenseTransactions = (transactions, budgetCycle)=>{
    if (!transactions.length || !budgetCycle) return [];

    return transactions
      .filter(({TransactionDate})=>TransactionDate.getMonth() === budgetCycle.getMonth() && TransactionDate.getFullYear() === budgetCycle.getFullYear())
      .filter(transaction=>!["Infor payroll", "Other income"].includes(transaction.Category) && transaction.Amount < 0 && !transaction.Description.match(/CREDIT CARD PAYMENT (?:MOBILE APP PAYMENT|ONLINE BANKING TRANSFER) TO \d{4} \d{6}\*{6}(\d{4})/i) && !transaction.Description.match(/PAYMENT - \w{5} \w{3} \w{7} \w{2}/i));
  };

  const getBudgetCycleTransactions = (transactions, budgetCycle)=>{
    //Get last cycle's income transactions
    const lastBudgetCycleIncomeTransactions = getLastBudgetCycleIncomeTransactions(transactions, budgetCycle);
    const currentBudgetCycleIncomeTransactions = getCurrentBudgetCycleIncomeTransactions(transactions, budgetCycle);

    //Get this month's transactions (minus income)
    const currentBudgetCycleExpenseTransactions = getCurrentBudgetCycleExpenseTransactions(transactions, budgetCycle);

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

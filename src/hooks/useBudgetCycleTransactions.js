import {useState, useEffect} from 'react';

const useBudgetCycleTransactions = (transactions, budgetCycle)=>{
  //Declare functions
  const getBudgetCycleTransactions = (transactions, budgetCycle)=>{
    if (!transactions.length || !budgetCycle) return [];

    const lastBudgetCycleMonth = ((budgetCycle.getMonth() - 1 + 12) % 12); //last month, looping over 12
    const lastBudgetCycleYear = (budgetCycle.getMonth() -1 < 0 ? budgetCycle.getFullYear() - 1 : budgetCycle.getFullYear());

    //Get last cycle's income transactions
    const lastBudgetCycleIncomeTransactions = transactions
      .filter(({TransactionDate})=>TransactionDate.getMonth() === lastBudgetCycleMonth && TransactionDate.getFullYear() === lastBudgetCycleYear)
      .filter(({Category})=>Category === "Infor payroll");

    //Get this month's transactions (minus income)
    const thisBudgetCycleTransactions = transactions
      .filter(({TransactionDate})=>TransactionDate.getMonth() === budgetCycle.getMonth() && TransactionDate.getFullYear() === budgetCycle.getFullYear())
      .filter(({Category})=>Category !== "Infor payroll");

    return [...lastBudgetCycleIncomeTransactions, ...thisBudgetCycleTransactions];
  }

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

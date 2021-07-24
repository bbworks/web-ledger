import {useState, useEffect} from 'react';

const useBudgetCycleTransactions = (transactions, budgetCycle)=>{
  //Declare functions
  const getBudgetCycleTransactions = (transactions, budgetCycle)=>{
    if (!transactions.length || !budgetCycle) return [];
    return transactions.filter(({TransactionDate})=>TransactionDate.getMonth() === budgetCycle.getMonth() && TransactionDate.getFullYear() === budgetCycle.getFullYear());
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

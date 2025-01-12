import {useState, useEffect} from 'react';

import {getSumByProp, getBudgetTransactions} from './../utilities';


const useBudgetCycleBudgets = (budgetsData, budgetCycle, budgetCycleTransactions)=>{
  //Declare functions
  const getBudgetCycleDistance = (referenceBudgetCycle, differenceBudgetCycle)=>{
    const referenceBudgetCycleInt = referenceBudgetCycle.getUTCFullYear()*12+referenceBudgetCycle.getUTCMonth();
    const differenceBudgetCycleInt = differenceBudgetCycle.getUTCFullYear()*12+differenceBudgetCycle.getUTCMonth();
    return differenceBudgetCycleInt - referenceBudgetCycleInt;
  };
  
  const getBudgetCycleBudgets = (budgetsData, budgetCycle, budgetCycleTransactions)=>{
    if (!(budgetCycle instanceof Date)) return [];

    // Filter down to budgets within this budgetCycle (or ongoing from previous budgetCycle)
    const budgetCycleBudgets = budgetsData.filter(b=>
      b.BudgetCycle.getTime() === budgetCycle.getTime() /* budgets from this budgetCycle */
      || (b.BudgetCycle.getTime() < budgetCycle.getTime() && b.DueNext?.getTime() > budgetCycle.getTime()) /* budgets from a previous budgetCycle */
    )
    .map(b=>{
      const budgetTransactions = (budgetCycleTransactions?.all && budgetCycleTransactions?.previous ? getBudgetTransactions(b.Name, [...budgetCycleTransactions.all, ...budgetCycleTransactions.previous]) : []);
      const budgetTransactionsTotalSpent = getSumByProp(budgetTransactions, "Amount") || 0;
      const budgetTransactionsCurrentSpent = getSumByProp((budgetCycleTransactions?.all ? getBudgetTransactions(b.Name, budgetCycleTransactions.all) : []), "Amount") || 0;
      const budgetTransactionsPreviousSpent = getSumByProp((budgetCycleTransactions?.previous ? getBudgetTransactions(b.Name, budgetCycleTransactions.previous) : []), "Amount") || 0;
      const budgetCyclesRemaining = (b.DuePeriod === "Monthly" ? 1 : getBudgetCycleDistance(budgetCycle, b.DueNext));
      
      const amountRemainingExpectedPerBudgetCycle = (b.DuePeriod === "Monthly" ? b.Amount : Math.min(0, (budgetCyclesRemaining === 0 ? b.Amount - budgetTransactionsPreviousSpent : (b.Amount - budgetTransactionsPreviousSpent)/budgetCyclesRemaining)));
      const budgetCycleAmount = (b.DuePeriod === "Monthly" ? b.Amount : /* Total per budgetCycle - current budgetCycle Spent */ Math.min(0, amountRemainingExpectedPerBudgetCycle /*- budgetTransactionsCurrentSpent*/));
      
      // console.log("budgetCycleBudget", b.Name)
      // console.log("budgetCycleTransactions", budgetCycleTransactions)
      // console.log("budgetTransactions", budgetTransactions)
      // console.log("budgetTransactionsTotalSpent", budgetTransactionsTotalSpent)
      // console.log("budgetTransactionsCurrentSpent", budgetTransactionsCurrentSpent)
      // console.log("budgetTransactionsPreviousSpent", budgetTransactionsPreviousSpent)
      // console.log("budgetCycleAmount", budgetCycleAmount)
      
      return {
        ...b,
        Transactions: budgetTransactions,
        Spent: budgetTransactionsTotalSpent,
        BudgetCycleSpent: budgetTransactionsCurrentSpent,
        BudgetCycleAmount: budgetCycleAmount,
        BudgetCyclePreviousSpent: budgetTransactionsPreviousSpent,
        BudgetCyclesRemaining: budgetCyclesRemaining,
      };
    });

    console.log("budgetCycleBudgets", budgetCycleBudgets);
    return budgetCycleBudgets;
  };

  //Initialize state
  const [budgetCycleBudgets, setBudgetCycleBudgets] = useState(getBudgetCycleBudgets(budgetsData, budgetCycle, budgetCycleTransactions));

  //Whenever transactions or budgetCycle changes,
  // update state
  useEffect(()=>
    setBudgetCycleBudgets(getBudgetCycleBudgets(budgetsData, budgetCycle, budgetCycleTransactions))
  , [budgetsData, budgetCycle, budgetCycleTransactions]);

  //Return the state
  return budgetCycleBudgets;
};

export default useBudgetCycleBudgets;

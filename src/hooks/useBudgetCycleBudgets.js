import {useState, useEffect} from 'react';

import {getBudgetCycleFromDate} from './../utilities';

const useBudgetCycleBudgets = (budgetsData, budgetCycle)=>{
  //Declare functions
  const getBudgetCycleBudgets = (budgetsData, budgetCycle)=>{
    const filteredBudgets = budgetsData.filter(b=>b.BudgetCycle.getTime() === budgetCycle.getTime());
    console.log("budgetCycleBudgets", filteredBudgets);
    return filteredBudgets;
  };

  //Initialize state
  const [budgetCycleBudgets, setBudgetCycleBudgets] = useState(getBudgetCycleBudgets(budgetsData, budgetCycle));

  //Whenever transactions or budgetCycle changes,
  // update state
  useEffect(()=>
    setBudgetCycleBudgets(getBudgetCycleBudgets(budgetsData, budgetCycle))
  , [budgetsData, budgetCycle]);

  //Return the state
  return budgetCycleBudgets;
};

export default useBudgetCycleBudgets;

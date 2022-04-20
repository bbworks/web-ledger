import {useEffect} from 'react';
import {useLocation} from 'react-router-dom';

import BudgetGraph from './../BudgetGraph';
import DashboardBudgetCycleDropdown from './../DashboardBudgetCycleDropdown';

import {getBudgetAmountSpentFromTransactions} from './../../utilities';

import {useBudgetCycleTransactions, useBudgetCycleBudgets} from './../../hooks';

import './index.scss';

const BudgetsView = ({ transactions, budgetsData, budgetCycle, allBudgetCycles, onBudgetCycleChange, setFooterNavbar })=>{
  //Send the route to the footer navbar
  const route = useLocation().pathname;
  useEffect(()=>{
    setFooterNavbar(route);
  }, [route]);

  const budgetCycleTransactions = useBudgetCycleTransactions(transactions, budgetCycle);
  const budgetCycleBudgets = useBudgetCycleBudgets(budgetsData, budgetCycle);

  return (
    <div className="view budgets-view">
      <DashboardBudgetCycleDropdown transactions={transactions} budgetCycle={budgetCycle} allBudgetCycles={allBudgetCycles} onChange={onBudgetCycleChange} squashed />
      <div class="container">
        <h1 className="page-title display-3">Month Overview</h1>
        <div className="budget-graphs">

          {
            (
              !budgetCycleBudgets ?
              '' :
              budgetCycleBudgets.map(budgetData=>
                <BudgetGraph key={budgetData.Name} budget={{...budgetData, color: "#2196f3", amountSpent: getBudgetAmountSpentFromTransactions(budgetData.Name, budgetCycleTransactions.all)}}/>
              )
            )
          }
        </div>
      </div>
    </div>
  );
};

export default BudgetsView;

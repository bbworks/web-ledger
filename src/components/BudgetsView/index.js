import {useEffect} from 'react';
import {useLocation} from 'react-router-dom';

import BudgetGraph from './../BudgetGraph';

import {getBudgetAmountSpentFromTransactions} from './../../utilities';

import {useBudgetCycleTransactions} from './../../hooks';

import './index.scss';

const BudgetsView = ({ transactions, budgetsData, budgetCycle, setFooterNavbar })=>{
  //Send the route to the footer navbar
  const route = useLocation().pathname;
  useEffect(()=>{
    setFooterNavbar(route);
  }, []);

  const currentBudgetCycleTransactions = useBudgetCycleTransactions(transactions, budgetCycle);

  return (
    <div className="view budgets-view container-fluid py-2">
      <div className="budget-graphs container">
        <h2 className="budgets-title text-center fw-bold">Month Overview</h2>

        {
          (
            !budgetsData ?
            '' :
            budgetsData.map(budgetData=>{
              const {Name, Amount, Type} = budgetData;
              return <BudgetGraph key={Name} budget={{...budgetData, color: "#2196f3", amountSpent: getBudgetAmountSpentFromTransactions(Name, currentBudgetCycleTransactions)}}/>
            })
          )
        }
      </div>
    </div>
  );
};

export default BudgetsView;

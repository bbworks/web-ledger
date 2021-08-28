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

  const budgetCycleTransactions = useBudgetCycleTransactions(transactions, budgetCycle);

  return (
    <div className="view budgets-view">
    <h1 className="page-title display-3">Month Overview</h1>
      <div className="budget-graphs">

        {
          (
            !budgetsData ?
            '' :
            budgetsData.map(budgetData=>{
              const {Name, Amount, Type} = budgetData;
              return <BudgetGraph key={Name} budget={{...budgetData, color: "#2196f3", amountSpent: getBudgetAmountSpentFromTransactions(Name, budgetCycleTransactions.all)}}/>
            })
          )
        }
      </div>
    </div>
  );
};

export default BudgetsView;

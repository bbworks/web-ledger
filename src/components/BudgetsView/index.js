import {useEffect} from 'react';
import {useLocation} from 'react-router-dom';

import BudgetGraph from './../BudgetGraph';

import {getBudgetAmountSpentFromTransactions} from './../../utilities';

import './index.scss';

const BudgetsView = ({ transactions, budgetsData, setFooterNavbar })=>{
  //Send the route to the footer navbar
  const route = useLocation().pathname;
  useEffect(()=>{
    setFooterNavbar(route);
  }, []);

  return (
    <div className="view budgets-view container-fluid py-2">
      <div className="budget-graphs container">
        <h2 className="budgets-title text-center fw-bold">Month Overview</h2>

        {
          (
            !budgetsData ?
            '' :
            budgetsData.map(budgetData=>{
              const {name, amount, type} = budgetData;
              return <BudgetGraph key={name} budget={{title: name, type: type, color: "#2196f3", budgetedAmount: amount, amountSpent: getBudgetAmountSpentFromTransactions(name, transactions)}}/>
            })
          )
        }
      </div>
    </div>
  );
};

export default BudgetsView;

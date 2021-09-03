import {convertNumberToCurrency} from './../../utilities';

import BudgetGraphStatusIcon from './../BudgetGraphStatusIcon';

import './index.scss';

const BudgetGraph = ({ budget })=>{
  const isExpenseBudget = budget.Type !== "income";
  const overBudget = (isExpenseBudget ? budget.amountSpent < budget.Amount : false);
  const overEarned = (!isExpenseBudget ? budget.amountSpent > budget.Amount : false);

  return (
    <div className="budget-graph-container my-4">
      <h5 className="budget-graph-title d-inline-block">{budget.Name}</h5>
      <BudgetGraphStatusIcon budget={budget} overBudget={overBudget} overEarned={overEarned} />
      <div className="budget-graph-bar-outer">
        <h6 className="budget-graph-bar-stats" style={
          {
            color: (!overBudget
              ? "black" //"rgb(245,245,245)"
              : "red"
            ),
          }
        }>
          {convertNumberToCurrency(Math.abs(budget.amountSpent))} of {convertNumberToCurrency(Math.abs(budget.Amount))} {(isExpenseBudget ? "spent" : "earned")}
        </h6>
        <h6 className="budget-graph-bar-remaining text-muted" >
          {convertNumberToCurrency(budget.Amount - budget.amountSpent)} {(overBudget ? "overspent" : "remaining")}
        </h6>
        <div className="budget-graph-bar-inner" style={
          {
            backgroundColor: (!isExpenseBudget ? "green" :  (overBudget ? "red" : budget.color)),
            width: (overBudget
              ? `calc(100% * ${(budget.amountSpent - budget.Amount)/budget.Amount})`
              : `calc(100% * ${budget.amountSpent/budget.Amount})`
            ),
            left: (overBudget
              ? "unset"
              : 0
            ),
            right: (overBudget
              ? 0
              : "unset"
            ),
          }
        }></div>
      </div>
    </div>
  );
};

export default BudgetGraph;

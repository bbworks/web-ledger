import {convertNumberToCurrency} from './../../utilities';

import BudgetGraphStatusIcon from './../BudgetGraphStatusIcon';

import './index.scss';

const BudgetGraph = ({ budget })=>{
  const isExpenseBudget = budget.Type !== "income";
  const overBudget = (isExpenseBudget ? budget.Spent < budget.Amount : false);
  const overEarned = (!isExpenseBudget ? budget.Spent > budget.Amount : false);
  const budgetCyclePreviousSpentDecimal = budget.BudgetCyclePreviousSpent/budget.Amount;
  const budgetCycleSpentDecimal = budget.BudgetCycleSpent/budget.Amount;
  const budgetCycleSpentOverDecimal = (budget.Spent - budget.Amount)/budget.Amount;

  return (
    <div className="budget-graph-container my-4">
      <h5 className="budget-graph-title d-inline-block">{budget.Name}</h5>
      <BudgetGraphStatusIcon budget={budget} overBudget={overBudget} overEarned={overEarned} />
      <div className="budget-graph-bar-outer">
        <h6 className="budget-graph-bar-stats" style={
          {
            color: (!overBudget
              ? "black" //"rgb(245,245,245)"
              : "darkred"
            ),
          }
        }>
          {convertNumberToCurrency(Math.abs(budget.Spent))} of {convertNumberToCurrency(Math.abs(budget.Amount))} {(isExpenseBudget ? "spent" : "earned")}
        </h6>
        <h6 className="budget-graph-bar-remaining text-muted" >
          { budget.Type === "bill" && budget.BudgetCycleSpent === budget.BudgetCycleAmount 
            ? "" 
            : `${convertNumberToCurrency((budget.Amount - budget.Spent) * -1)} ${(overBudget ? ( budget.Type === "bill" ? "overpaid" : (budget.Type == "income" ? "under-earned" : "overspent")) : ( budget.Type === "bill" && budget.BudgetCycleSpent === 0 ? "pending" : (budget.Type === "bill" ? "saved" : (budget.Type == "income" ? "over-earned" : "remaining"))))}`
          }
        </h6>
        <div className="budget-graph-bar-previous" style={
          {
            backgroundColor: (!isExpenseBudget ? "green" :  (overBudget ? "red" : budget.color)),
            width: (overBudget
              ? 0
              : `calc(100% * ${budgetCyclePreviousSpentDecimal})`
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
        <div className="budget-graph-bar-inner" style={
          {
            backgroundColor: (!isExpenseBudget ? "green" :  (overBudget ? "red" : budget.color)),
            width: (overBudget
              ? `calc(100% * ${budgetCycleSpentOverDecimal})`
              : `calc(100% * ${budgetCycleSpentDecimal})`
            ),
            left: (overBudget
              ? "unset"
              : `${budgetCyclePreviousSpentDecimal*100}%`
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

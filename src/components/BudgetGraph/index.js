import {useState, useEffect} from 'react';

import {convertNumberToCurrency} from './../../utilities.js';

import './index.scss';

const BudgetGraph = ({ budget })=>{
  const overBudget = budget.amountSpent > budget.budgetedAmount;

  return (
    <div className="dashboard-overview-budget-graph-container">
      <h4 className="dashboard-overview-budget-graph-title">{budget.title}</h4>
      <div className="dashboard-overview-budget-graph-bar-outer">
        <h5 className="dashboard-overview-budget-graph-bar-stats" style={
          {
            color: (!overBudget
              ? "rgb(245,245,245)"
              : "red"
            ),
          }
        }>
          {convertNumberToCurrency(budget.amountSpent)} of {convertNumberToCurrency(budget.budgetedAmount)} spent
        </h5>
        <h5 className="dashboard-overview-budget-graph-bar-remaining text-muted" >
          {convertNumberToCurrency(budget.budgetedAmount - budget.amountSpent)} {(overBudget ? "overspent" : "remaining")}
        </h5>
        <div className="dashboard-overview-budget-graph-bar-inner" style={
          {
            backgroundColor: budget.color,
            width: (overBudget
              ? `calc(100% * ${(budget.amountSpent - budget.budgetedAmount)/budget.budgetedAmount})`
              : `calc(100% * ${budget.amountSpent/budget.budgetedAmount})`
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

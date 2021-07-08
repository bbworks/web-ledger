import {useState, useEffect} from 'react';

import {convertNumberToCurrency} from './../../utilities';

import './index.scss';

const BudgetGraph = ({ budget })=>{
  const isExpenseBudget = budget.budgetedAmount <= 0
  const overBudget = (isExpenseBudget ? budget.amountSpent < budget.budgetedAmount : budget.amountSpent > budget.budgetedAmount);

  const BudgetGraphStatusIcon = ({ budget })=> {
    let iconClass;
    let iconText;
    let iconColor;

    if (budget.type === "bill") {
      if (budget.amountSpent) {
        if (!overBudget) {
          iconClass = "fas fa-check-circle";
          iconText = "Paid";
          iconColor = "success";
        }
        else {
          iconClass = "fas fa-times-circle";
          iconText = "Overpaid";
          iconColor = "danger";
        }
      }
      else {
        iconClass = "";
        iconText = "Pending";
        iconColor = "secondary";
      }
    }

    if (budget.type === "bill") {
      return (
        <div className={`budget-graph-status-icon-container d-inline-block badge rounded-pill text-${iconColor} bg-light ms-1 border border-${iconColor}`}>
          <i className={`budget-graph-status-icon fas fa-xs ${iconClass} me-1`}></i>
          <span>{iconText}</span>
        </div>
      )
    }

    return null;
  };


  return (
    <div className="budget-graph-container my-4">
      <h5 className="budget-graph-title d-inline-block">{budget.title}</h5>
      <BudgetGraphStatusIcon budget={budget} />
      <div className="budget-graph-bar-outer">
        <h6 className="budget-graph-bar-stats" style={
          {
            color: (!overBudget
              ? "black" //"rgb(245,245,245)"
              : "red"
            ),
          }
        }>
          {convertNumberToCurrency(Math.abs(budget.amountSpent))} of {convertNumberToCurrency(Math.abs(budget.budgetedAmount))} spent
        </h6>
        <h6 className="budget-graph-bar-remaining text-muted" >
          {convertNumberToCurrency(budget.budgetedAmount - budget.amountSpent)} {(overBudget ? "overspent" : "remaining")}
        </h6>
        <div className="budget-graph-bar-inner" style={
          {
            backgroundColor: (!isExpenseBudget ? "green" :  (overBudget ? "red" : budget.color)),
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

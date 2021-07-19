import {useState, useEffect} from 'react';

import {convertNumberToCurrency} from './../../utilities';

import './index.scss';

const BudgetGraphStatusIcon = ({ budget, overBudget })=> {
  let iconClass;
  let iconText;
  let iconColor;

  if (budget.Type === "bill") {
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

  if (budget.Type === "bill") {
    return (
      <div className={`budget-graph-status-icon-container d-inline-block badge rounded-pill text-${iconColor} bg-light ms-1 border border-${iconColor}`}>
        <i className={`budget-graph-status-icon fas fa-xs ${iconClass} me-1`}></i>
        <span>{iconText}</span>
      </div>
    )
  }

  return null;
};

export default BudgetGraphStatusIcon;

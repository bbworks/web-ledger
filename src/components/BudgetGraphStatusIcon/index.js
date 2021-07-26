import {useState, useEffect} from 'react';

import {convertNumberToCurrency} from './../../utilities';

import './index.scss';

const BudgetGraphStatusIcon = ({ budget, overBudget, overEarned })=> {
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
  if (budget.Type === "income") {
    if (budget.amountSpent) {
      if (budget.amountSpent === budget.Amount) {
        iconClass = "fas fa-check-circle";
        iconText = "Earned";
        iconColor = "success";
      }
      if (overEarned) {
        iconClass = "fas fa-check-circle";
        iconText = "Over-earned";
        iconColor = "success";
      }
      if (!overEarned) {
        iconClass = "fas fa-exclamation-triangle";
        iconText = "Under-earned";
        iconColor = "warning";
      }
    }
  }

  //If there's an icon to render, render
  if (iconText) {
    return (
      <div className={`budget-graph-status-icon-container d-inline-block badge rounded-pill text-${iconColor} bg-light ms-1 border border-${iconColor}`}>
        <i className={`budget-graph-status-icon fas fa-xs ${iconClass} me-1`}></i>
        <span>{iconText}</span>
      </div>
    )
  }

  //Otherwise, return null
  return null;
};

export default BudgetGraphStatusIcon;

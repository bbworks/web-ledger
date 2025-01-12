import {useState, useEffect} from 'react';

import {getSumByProp} from './../../utilities';

import './index.scss';

const DashboardShowcase = ({ budgetCycle, budgetCycleTransactions, budgetCycleBudgets, totalIncome, totalExpenses, remainingBillsToBePaid, remainingBillsToBePaidTotal, leftoverPaidBills, leftoverPaidBillsTotal, remainingSavingsToBeSaved, remainingSavingsToBeSavedTotal, remainingGiving, remainingGivingTotal, remainingFlexibleSpendingMoney, isCurrentBudgetCycle, isPastBudgetCycle, isFutureBudgetCycle })=>{
  //Current statuses
  const getBudgetCycleStatus = (budgetCycle, budgetCycleTransactions, budgetCycleBudgets)=>{
    if (!budgetCycleBudgets.length) return null;

    const lowRemainingFlexibleSpendingMoneyAmount = 250;

    const budgetCycleStatuses = [
      {
        heading: "Over-budget 😔",
        description: "You have majorly overspent this month.",
        test: (budgetCycleBudgets)=>{
          return isCurrentBudgetCycle && (totalIncome + totalExpenses) < 0;
        }
      },
      {
        heading: "Looking bad 😬",
        description: "You are projected to overspend this month.",
        test: (budgetCycleBudgets)=>{
          return isCurrentBudgetCycle && remainingFlexibleSpendingMoney < 0;
        }
      },
      {
        heading: "Getting tight 😯",
        description: "You are running low on money.",
        test: (budgetCycleBudgets)=>{
          return isCurrentBudgetCycle && remainingFlexibleSpendingMoney < lowRemainingFlexibleSpendingMoneyAmount;
        }
      },
      {
        heading: "All good! 💃",
        description: "You are on track for this month.",
        test: (budgetCycleBudgets)=>{
          const totalIncome = getSumByProp(budgetCycleTransactions.income, "Amount");
          const totalExpenses = getSumByProp(budgetCycleTransactions.expenses, "Amount");
          return isCurrentBudgetCycle && remainingFlexibleSpendingMoney >= lowRemainingFlexibleSpendingMoneyAmount;
        }
      },
      //Past statuses
      {
        heading: "Over-budget 😔",
        description: "You overspent this month.",
        test: (budgetCycleBudgets)=>{
          return isPastBudgetCycle && (totalIncome + totalExpenses) < 0;
        }
      },
      {
        heading: "Done 😌",
        description: "You were on track for this month.",
        test: (budgetCycleBudgets)=>{
          return isPastBudgetCycle && (totalIncome + totalExpenses) >= 0;
        }
      },
      //Future statuses
      {
        heading: " 😔",
        description: "You're going to overspend this month.",
        test: (budgetCycleBudgets)=>{
          return isFutureBudgetCycle && (totalIncome + totalExpenses) < 0;
        }
      },
      {
        heading: "Looking good 😌",
        description: "You're going to be on track for this month.",
        test: (budgetCycleBudgets)=>{
          return isFutureBudgetCycle && (totalIncome + totalExpenses) >= 0;
        }
      },
    ];
    
    return budgetCycleStatuses.find(status=>status.test(budgetCycleBudgets));
  };
  
  const [budgetCycleStatus, setBudgetCycleStatus] = useState(getBudgetCycleStatus(budgetCycle, budgetCycleTransactions, budgetCycleBudgets));

  useEffect(()=>
    setBudgetCycleStatus(getBudgetCycleStatus(budgetCycle, budgetCycleTransactions, budgetCycleBudgets))
  , [budgetCycle, budgetCycleTransactions, budgetCycleBudgets]);

  return (
    <div className="dashboard-showcase container d-flex flex-column justify-content-center align-items-center bg-primary text-light my-3 mx-auto">
      <i className="dashboard-showcase-icon fas fa-check-circle fa-2x mb-4"></i>
      <h3 className="dashboard-showcase-heading fw-bold h2">{budgetCycleStatus?.heading}</h3>
      <span className="dashboard-showcase-description h6 text-center">{budgetCycleStatus?.description}</span>
    </div>
  );
};

export default DashboardShowcase;

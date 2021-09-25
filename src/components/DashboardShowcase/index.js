import {useState, useEffect} from 'react';

import {getSumByProp, getBudgetCycleFromDate, getBudgetAmountSpentFromTransactions} from './../../utilities';

import './index.scss';

const DashboardShowcase = ({ budgetCycle, budgetCycleTransactions, budgetsData })=>{
  //Current statuses
  const budgetCycleStatuses = [
    {
      heading: "Over-budget 😔",
      description: "You have majorly overspent this month.",
      test: (budgetCycle, budgetCycleTransactions, budgetsData)=>{
        const isCurrentBudgetCycle = budgetCycle.getTime() === getBudgetCycleFromDate(new Date()).getTime();
        const totalIncome = getSumByProp(budgetCycleTransactions.income, "Amount");
        const totalExpenses = getSumByProp(budgetCycleTransactions.expenses, "Amount");
        return isCurrentBudgetCycle && (totalIncome + totalExpenses) < 0;
			}
    },
    {
      heading: "Looking bad 😬",
      description: "You are projected to overspend this month.",
      test: (budgetCycle, budgetCycleTransactions, budgetsData)=>{
        const isCurrentBudgetCycle = budgetCycle.getTime() === getBudgetCycleFromDate(new Date()).getTime();
        const totalIncome = getSumByProp(budgetCycleTransactions.income, "Amount");
        const totalExpenses = getSumByProp(budgetCycleTransactions.expenses, "Amount");
        const remainingBillsToBePaid =
          /* Add a "Spent" key to each budget data */
          budgetsData.map(b=>({
            ...b,
            Spent: getBudgetAmountSpentFromTransactions(b.Name, budgetCycleTransactions.all) || 0,
          }))
          /* filter to only bills that have NOT been paid */
          .filter(b=>b.Type==="bill" && b.Spent===0)
          /* Get the sum of all the remaining money AFTER paid bills */
          .reduce((total,b)=>total+=((b.Amount-b.Spent)*-1), 0)
          /* Return the inverse (negative is surplus) */
          *-1;
        const leftoverPaidBillsMoney =
          /* Add a "Spent" key to each budget data */
          budgetsData.map(b=>({
            ...b,
            Spent: getBudgetAmountSpentFromTransactions(b.Name, budgetCycleTransactions.all) || 0,
          }))
          /* filter to only bills that have been paid */
          .filter(b=>b.Type==="bill" && b.Spent!==0)
          /* Get the sum of all the remaining money AFTER paid bills */
          .reduce((total,b)=>total+=((b.Amount-b.Spent)*-1), 0)
        const remainingSavingsToBeSaved =
          /* Add a "Spent" key to each budget data */
          budgetsData.map(b=>({
            ...b,
            Spent: getBudgetAmountSpentFromTransactions(b.Name, budgetCycleTransactions.all) || 0,
          }))
          /* filter to only savings */
          .filter(b=>b.Type==="savings")
          /* Get the sum of all the remaining money AFTER paid bills */
          .reduce((total,b)=>total+=((b.Amount-b.Spent)*-1), 0)
          /* Return the inverse (negative is surplus) */
          *-1;
          const remainingFlexibleSpendingMoney = totalIncome + totalExpenses + leftoverPaidBillsMoney + remainingBillsToBePaid + remainingSavingsToBeSaved;
        console.log("Budget status: ", remainingFlexibleSpendingMoney, isCurrentBudgetCycle, totalIncome, totalExpenses, remainingBillsToBePaid, leftoverPaidBillsMoney, remainingSavingsToBeSaved)
        return isCurrentBudgetCycle && remainingFlexibleSpendingMoney < 0;
			}
    },
    {
      heading: "Getting tight 😯",
      description: "You are running low on money.",
      test: (budgetCycle, budgetCycleTransactions, budgetsData)=>{
        const isCurrentBudgetCycle = budgetCycle.getTime() === getBudgetCycleFromDate(new Date()).getTime();
        const totalIncome = getSumByProp(budgetCycleTransactions.income, "Amount");
        const totalExpenses = getSumByProp(budgetCycleTransactions.expenses, "Amount");
        const remainingBillsToBePaid =
          /* Add a "Spent" key to each budget data */
          budgetsData.map(b=>({
            ...b,
            Spent: getBudgetAmountSpentFromTransactions(b.Name, budgetCycleTransactions.all) || 0,
          }))
          /* filter to only bills that have NOT been paid */
          .filter(b=>b.Type==="bill" && b.Spent===0)
          /* Get the sum of all the remaining money AFTER paid bills */
          .reduce((total,b)=>total+=((b.Amount-b.Spent)*-1), 0)
          /* Return the inverse (negative is surplus) */
          *-1;
        const leftoverPaidBillsMoney =
          /* Add a "Spent" key to each budget data */
          budgetsData.map(b=>({
            ...b,
            Spent: getBudgetAmountSpentFromTransactions(b.Name, budgetCycleTransactions.all) || 0,
          }))
          /* filter to only bills that have been paid */
          .filter(b=>b.Type==="bill" && b.Spent!==0)
          /* Get the sum of all the remaining money AFTER paid bills */
          .reduce((total,b)=>total+=((b.Amount-b.Spent)*-1), 0)
        const remainingSavingsToBeSaved =
          /* Add a "Spent" key to each budget data */
          budgetsData.map(b=>({
            ...b,
            Spent: getBudgetAmountSpentFromTransactions(b.Name, budgetCycleTransactions.all) || 0,
          }))
          /* filter to only savings */
          .filter(b=>b.Type==="savings")
          /* Get the sum of all the remaining money AFTER paid bills */
          .reduce((total,b)=>total+=((b.Amount-b.Spent)*-1), 0)
          /* Return the inverse (negative is surplus) */
          *-1;
          const remainingFlexibleSpendingMoney = totalIncome + totalExpenses + leftoverPaidBillsMoney + remainingBillsToBePaid + remainingSavingsToBeSaved;
        return isCurrentBudgetCycle && remainingFlexibleSpendingMoney < 250;
			}
    },
    {
      heading: "All good! 💃",
      description: "You are on track for this month.",
      test: (budgetCycle, budgetCycleTransactions, budgetsData)=>{
        const isCurrentBudgetCycle = budgetCycle.getTime() === getBudgetCycleFromDate(new Date()).getTime();
        const totalIncome = getSumByProp(budgetCycleTransactions.income, "Amount");
        const totalExpenses = getSumByProp(budgetCycleTransactions.expenses, "Amount");
        const remainingBillsToBePaid =
          /* Add a "Spent" key to each budget data */
          budgetsData.map(b=>({
            ...b,
            Spent: getBudgetAmountSpentFromTransactions(b.Name, budgetCycleTransactions.all) || 0,
          }))
          /* filter to only bills that have NOT been paid */
          .filter(b=>b.Type==="bill" && b.Spent===0)
          /* Get the sum of all the remaining money AFTER paid bills */
          .reduce((total,b)=>total+=((b.Amount-b.Spent)*-1), 0)
          /* Return the inverse (negative is surplus) */
          *-1;
        const leftoverPaidBillsMoney =
          /* Add a "Spent" key to each budget data */
          budgetsData.map(b=>({
            ...b,
            Spent: getBudgetAmountSpentFromTransactions(b.Name, budgetCycleTransactions.all) || 0,
          }))
          /* filter to only bills that have been paid */
          .filter(b=>b.Type==="bill" && b.Spent!==0)
          /* Get the sum of all the remaining money AFTER paid bills */
          .reduce((total,b)=>total+=((b.Amount-b.Spent)*-1), 0)
        const remainingSavingsToBeSaved =
          /* Add a "Spent" key to each budget data */
          budgetsData.map(b=>({
            ...b,
            Spent: getBudgetAmountSpentFromTransactions(b.Name, budgetCycleTransactions.all) || 0,
          }))
          /* filter to only savings */
          .filter(b=>b.Type==="savings")
          /* Get the sum of all the remaining money AFTER paid bills */
          .reduce((total,b)=>total+=((b.Amount-b.Spent)*-1), 0)
          /* Return the inverse (negative is surplus) */
          *-1;
          const remainingFlexibleSpendingMoney = totalIncome + totalExpenses + leftoverPaidBillsMoney + remainingBillsToBePaid + remainingSavingsToBeSaved;
        return isCurrentBudgetCycle && remainingFlexibleSpendingMoney >= 250;
			}
    },
    //Past statuses
    {
      heading: "Over-budget 😔",
      description: "You overspent this month.",
      test: (budgetCycle, budgetCycleTransactions, budgetsData)=>{
        const isPastBudgetCycle = budgetCycle.getTime() < getBudgetCycleFromDate(new Date()).getTime();
        const totalIncome = getSumByProp(budgetCycleTransactions.income, "Amount");
        const totalExpenses = getSumByProp(budgetCycleTransactions.expenses, "Amount");
        return isPastBudgetCycle && (totalIncome + totalExpenses) < 0;
			}
    },
    {
      heading: "Done 😌",
      description: "You were on track for this month.",
      test: (budgetCycle, budgetCycleTransactions, budgetsData)=>{
        const isPastBudgetCycle = budgetCycle.getTime() < getBudgetCycleFromDate(new Date()).getTime();
        const totalIncome = getSumByProp(budgetCycleTransactions.income, "Amount");
        const totalExpenses = getSumByProp(budgetCycleTransactions.expenses, "Amount");
        return isPastBudgetCycle && (totalIncome + totalExpenses) >= 0;
			}
    },
    //Future statuses
    {
      heading: " 😔",
      description: "You're going to overspend this month.",
      test: (budgetCycle, budgetCycleTransactions, budgetsData)=>{
        const isFutureBudgetCycle = budgetCycle.getTime() > getBudgetCycleFromDate(new Date()).getTime();
        const totalIncome = getSumByProp(budgetCycleTransactions.income, "Amount");
        const totalExpenses = getSumByProp(budgetCycleTransactions.expenses, "Amount");
        return isFutureBudgetCycle && (totalIncome + totalExpenses) < 0;
			}
    },
    {
      heading: "Looking good 😌",
      description: "You're going to be on track for this month.",
      test: (budgetCycle, budgetCycleTransactions, budgetsData)=>{
        const isFutureBudgetCycle = budgetCycle.getTime() > getBudgetCycleFromDate(new Date()).getTime();
        const totalIncome = getSumByProp(budgetCycleTransactions.income, "Amount");
        const totalExpenses = getSumByProp(budgetCycleTransactions.expenses, "Amount");
        return isFutureBudgetCycle && (totalIncome + totalExpenses) >= 0;
			}
    },
  ];

  const getBudgetCycleStatus = (budgetCycle, budgetCycleTransactions, budgetsData)=>{
    if (!budgetCycle || !budgetCycleTransactions.all.length || !budgetsData.length) return null;
    return budgetCycleStatuses.find(status=>status.test(budgetCycle, budgetCycleTransactions, budgetsData));
  };

  const [budgetCycleStatus, setBudgetCycleStatus] = useState(getBudgetCycleStatus(budgetCycle, budgetCycleTransactions, budgetsData));

  useEffect(()=>
    setBudgetCycleStatus(getBudgetCycleStatus(budgetCycle, budgetCycleTransactions, budgetsData))
  , [budgetCycle, budgetCycleTransactions, budgetsData]);

  return (
    <div className="dashboard-showcase container d-flex flex-column justify-content-center align-items-center bg-primary text-light my-3 mx-auto">
      <i className="dashboard-showcase-icon fas fa-check-circle fa-2x mb-4"></i>
      <h3 className="dashboard-showcase-heading fw-bold h2">{budgetCycleStatus?.heading}</h3>
      <span className="dashboard-showcase-description h6 text-center">{budgetCycleStatus?.description}</span>
    </div>
  );
};

export default DashboardShowcase;

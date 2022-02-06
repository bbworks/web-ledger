import {useState, useEffect} from 'react';

import DashboardInsight from './../DashboardInsight';
import {getSumByProp, convertNumberToCurrency, getBudgetAmountSpentFromTransactions} from './../../utilities';

import './index.scss';

const DashboardInsights = ({ budgetCycle, budgetCycleTransactions, budgetCycleBudgets })=>{
  const [insights, setInsights] = useState([]);

  const runInsights = ()=>{
    if (!budgetCycleTransactions.all.length || !budgetCycleBudgets.length) return;

    //First, remove all insights
    setInsights([]);

    //Declare variables
    const budgetCycleBudgetsWithSpent = budgetCycleBudgets.map(b=>({
      ...b,
      Spent: getBudgetAmountSpentFromTransactions(b.Name, budgetCycleTransactions.all) || 0,
    }));

    /* Check if less was earned for this month than expected */
    const incomeExpected = budgetCycleBudgets.find(budgetData=>budgetData.Name==="Infor payroll").Amount;
    const incomebudgetCycleBudgets = budgetCycleBudgets.filter(budgetData=>budgetData.Type==="income");
    const incomeEarned = incomebudgetCycleBudgets.reduce((total,b)=>total+=getBudgetAmountSpentFromTransactions(b.Name, budgetCycleTransactions.all), 0);
    const incomeUnderEarned = (incomeEarned - incomeExpected)*-1;
    if (incomeUnderEarned > 0) {
      const insight = {
        type: "danger",
        iconClass: "fas fa-chart-pie",
        title: "Analysis",
        text: `You have under-earned ${convertNumberToCurrency(incomeUnderEarned)} for this month.`
      };
      setInsights(previousInsights=>[...previousInsights, insight]);
    }

    /* Check if the user is over on any budgets */
    const budgetsOver = budgetCycleBudgetsWithSpent.filter(budgetDataWithSpent=>!["income","savings"].includes(budgetDataWithSpent.Type) && budgetDataWithSpent.Amount !== 0 && budgetDataWithSpent.Spent < budgetDataWithSpent.Amount);
    if (budgetsOver.length) {
      const insight = {
        type: "danger",
        iconClass: "fas fa-chart-pie",
        title: "Analysis",
        text: `You are overspent on ${budgetsOver.length} budgets.`
      };
      setInsights(previousInsights=>[...previousInsights, insight]);
    }

    /* Check if there is money left in the "Personal Spending" budget */
    const personalSpendingBudgetData = budgetCycleBudgets.find(budgetData=>budgetData.Name==="Personal Spending");
    const personalSpendingBudgetLeft = getBudgetAmountSpentFromTransactions("Personal Spending", budgetCycleTransactions.all) - personalSpendingBudgetData.Amount;
    if (personalSpendingBudgetLeft > 0) {
      const insight = {
        type: "primary",
        iconClass: "fas fa-chart-pie",
        title: "Analysis",
        text: `You have ${convertNumberToCurrency(personalSpendingBudgetLeft)} remaining in "Personal Spending".`
      };
      setInsights(previousInsights=>[...previousInsights, insight]);
    }

    /* Check if we spent more than last month */
    //const currentBudgetSpent = transactions.reduce((total,i)=>total+=i.amount);
    //const lastBudgetSpent = transactions.reduce((total,i)=>total+=i.amount);
    //const budgetCycleDifference = lastBudgetSpent-currentBudgetSpent;
    // if (budgetCycleDifference > 0) {
    //   const insight = {
    //     type: "danger",
    //     iconClass: "fas fa-sliders-h",
    //     title: "Insights",
    //     text: `You've spent ${convertNumberToCurrency(budgetCycleDifference)} more than last month.`
    //   };
    //   setInsights([...insights, insight]);
    // }

    /* Check if a bill has gone up */
    const bills = budgetCycleBudgets.filter(budgetData=>budgetData.type==="bill");
    bills.forEach(bill=>{
      const amountSpent = getBudgetAmountSpentFromTransactions(bill.name, budgetCycleTransactions.all)
      if (!amountSpent) return;
      if (Math.abs(amountSpent) > Math.abs(bill.amount)) {
        const insight = {
          type: "warning",
          iconClass: "fas fa-chart-bar",
          title: "Trends",
          text: `Bill "${bill.name}" has gone up ${convertNumberToCurrency(Math.abs(amountSpent)-Math.abs(bill.amount))}.`
        };
        setInsights(previousInsights=>[...previousInsights, insight]);
      }
    });

    /* Check how much money flexible money is left this budget cycle */
    const totalIncome = getSumByProp(budgetCycleTransactions.income, "Amount");
    const totalExpenses = getSumByProp(budgetCycleTransactions.expenses, "Amount");
    const remainingBillsToBePaid =
      /* Add a "Spent" key to each budget data */
      budgetCycleBudgetsWithSpent
      /* filter to only bills that have NOT been paid */
      .filter(b=>b.Type==="bill" && b.Spent===0)
      /* Get the sum of all the remaining money AFTER paid bills */
      .reduce((total,b)=>total+=((b.Amount-b.Spent)*-1), 0)
      /* Return the inverse (negative is surplus) */
      *-1;
    const leftoverPaidBillsMoney =
      /* Add a "Spent" key to each budget data */
      budgetCycleBudgetsWithSpent
      /* filter to only bills that have been paid */
      .filter(b=>b.Type==="bill" && b.Spent!==0)
      /* Get the sum of all the remaining money AFTER paid bills */
      .reduce((total,b)=>total+=((b.Amount-b.Spent)*-1), 0)
    const remainingSavingsToBeSaved =
      /* Add a "Spent" key to each budget data */
      budgetCycleBudgetsWithSpent
      /* filter to only savings */
      .filter(b=>b.Type==="savings")
      /* Get the sum of all the remaining money AFTER paid bills */
      .reduce((total,b)=>total+=((b.Amount-b.Spent)*-1), 0)
      /* Return the inverse (negative is surplus) */
      *-1;
    const remainingFlexibleSpendingMoney = totalIncome + totalExpenses + leftoverPaidBillsMoney + remainingBillsToBePaid + remainingSavingsToBeSaved;
    console.log(remainingFlexibleSpendingMoney, totalIncome, totalExpenses, leftoverPaidBillsMoney, remainingBillsToBePaid, remainingSavingsToBeSaved)
    if (remainingFlexibleSpendingMoney > 0) {
      const insight = {
        type: "primary",
        iconClass: "fas fa-chart-line",
        title: "Projection",
        text: `You have ${convertNumberToCurrency(remainingFlexibleSpendingMoney)} of flexible money remaining.`
      };
      setInsights(previousInsights=>[...previousInsights, insight]);
    }
    else {
      const insight = {
        type: "warning",
        iconClass: "fas fa-chart-line",
        title: "Projection",
        text: `You are ${convertNumberToCurrency(remainingFlexibleSpendingMoney)} in the negative of "flexible" money.`
      };
      setInsights(previousInsights=>[...previousInsights, insight]);
    }

    /* Check if there is money left to put into Savings */
    const savingsBudgetData = budgetCycleBudgets.find(budgetData=>budgetData.Name==="Savings");
    const savingsBudgetLeft = getBudgetAmountSpentFromTransactions("Savings", budgetCycleTransactions.all) - savingsBudgetData.Amount;
    if (savingsBudgetLeft > 0) {
      const insight = {
        type: "primary",
        iconClass: "fas fa-chart-pie",
        title: "Analysis",
        text: `You have ${convertNumberToCurrency(savingsBudgetLeft)} more to put into "Savings".`
      };
      setInsights(previousInsights=>[...previousInsights, insight]);
    }
  };

  useEffect(()=>{
    runInsights();
  }, [budgetCycleTransactions, budgetCycleBudgets]);

  return (
    <div className="dashboard-insights container mt-5">
      <h2 className="text-center mb-4">Insights</h2>
      {insights.map((insight,i)=>(
        <DashboardInsight key={i} insight={insight} />
      ))}
    </div>
  );
};

export default DashboardInsights;

import {useState, useEffect} from 'react';

import DashboardInsight from './../DashboardInsight';
import {getSumByProp, convertNumberToCurrency, getBudgetTransactions, getBudgetAmountSpentFromTransactions} from './../../utilities';

import './index.scss';

const DashboardInsights = ({ budgetCycle, budgetCycleTransactions, budgetCycleBudgets })=>{
  const [insights, setInsights] = useState([]);

  const runInsights = ()=>{
    if (!budgetCycleTransactions.all.length || !budgetCycleBudgets.length) return;

    //First, remove all insights
    setInsights([]);

    //Declare variables
    const budgetCycleBudgetsWithSpent = budgetCycleBudgets.map(b=>{
      const budgetTransactions = getBudgetTransactions(b.Name, budgetCycleTransactions.all);
      const budgetTransactionsSum = getSumByProp(budgetTransactions, "Amount") || 0;
      
      return {
        ...b,
        Transactions: budgetTransactions,
        Spent: budgetTransactionsSum,
      };
    });

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

    {
      /* Check if less was earned for this month than budgeted for */
      const budgetedAmount = getSumByProp(budgetCycleBudgets.filter(budgetData=>budgetData.Type!=="income"), "Amount");
      const incomebudgetCycleBudgets = budgetCycleBudgets.filter(budgetData=>budgetData.Type==="income");
      const incomeEarned = incomebudgetCycleBudgets.reduce((total,b)=>total+=getBudgetAmountSpentFromTransactions(b.Name, budgetCycleTransactions.all), 0);
      // const positiveEarned = getSumByProp(budgetCycleTransactions.income, "Amount");
      const incomeUnderEarned = (incomeEarned + /*-*/budgetedAmount);
      const insight = {
        type: (incomeUnderEarned >= 0 ? "success" : "danger"),
        iconClass: "fas fa-chart-pie",
        title: "Income",
        text: `You have ${incomeUnderEarned >= 0 ? "over" : "under"}-earned ${convertNumberToCurrency(incomeUnderEarned)} of ${convertNumberToCurrency(Math.abs(budgetedAmount))} budgeted for this month.`
      };
      setInsights(previousInsights=>[...previousInsights, insight]);
    }

    /* Check if the user is over on any non-bill budgets */
    const budgetsOver = budgetCycleBudgetsWithSpent.filter(budgetDataWithSpent=>!["income","savings","bill"].includes(budgetDataWithSpent.Type) && budgetDataWithSpent.Name !== "Miscellaneous" && budgetDataWithSpent.Spent < budgetDataWithSpent.Amount);
    if (budgetsOver.length) {
      const insight = {
        type: "danger",
        iconClass: "fas fa-exclamation",
        title: "Overspending",
        text: `You are overspent on ${budgetsOver.length} non-bill budgets: ${budgetsOver.map(b=>`${b.Name} (${convertNumberToCurrency(b.Amount-b.Spent)})`).join(", ")}.`
      };
      setInsights(previousInsights=>[...previousInsights, insight]);
    }

    /* Check if any bills were unpaid */
    const unpaidBillsWithSpent = budgetCycleBudgetsWithSpent.filter(budgetWithSpent=>budgetWithSpent.Type === "bill" && !budgetWithSpent.Spent && Number(budgetWithSpent.DueDate?.match(/[0-3]?[0-9](?=st|nd|rd|th)/)[0]) < new Date().getDate());
    if (unpaidBillsWithSpent.length) {
      unpaidBillsWithSpent.forEach(unpaidBillWithSpent=>{
        const insight = {
          type: "danger",
          iconClass: "fas fa-exclamation",
          title: "Late Bill",
          text: `You haven't paid bill ${unpaidBillWithSpent.Name} (${convertNumberToCurrency(Math.abs(unpaidBillWithSpent.Amount)-Math.abs(unpaidBillWithSpent.Spent))} due every ${unpaidBillWithSpent.DueDate}).`
        };
        console.log(unpaidBillWithSpent)
        setInsights(previousInsights=>[...previousInsights, insight]);
      });
    }

    /* Check if any bills were overpaid */
    const overspentBillsWithSpent = budgetCycleBudgetsWithSpent.filter(budgetWithSpent=>budgetWithSpent.Type === "bill" && budgetWithSpent.Spent < budgetWithSpent.Amount);
    if (overspentBillsWithSpent.length) {
      overspentBillsWithSpent.forEach(overspentBillWithSpent=>{
        const insight = {
          type: "warning",
          iconClass: "fas fa-exclamation",
          title: "Higher Bill",
          text: `You overpaid bill ${overspentBillWithSpent.Name} by ${convertNumberToCurrency(Math.abs(overspentBillWithSpent.Spent)-Math.abs(overspentBillWithSpent.Amount))}.`
        };
        console.log(overspentBillWithSpent)
        setInsights(previousInsights=>[...previousInsights, insight]);
      });
    }

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

    /* Check if there is money left in the "Personal Spending" or "Bradley" budget */
    const personalSpendingBudgets = budgetCycleBudgets.filter(budgetData=>["Personal Spending", "Bradley", "Sarah"].includes(budgetData.Name));
    personalSpendingBudgets.forEach(personalSpendingBudget=>{
      const personalSpendingBudgetLeft = getBudgetAmountSpentFromTransactions(personalSpendingBudget.Name, budgetCycleTransactions.all) - personalSpendingBudget.Amount;
      if (personalSpendingBudgetLeft > 0) {
        const insight = {
          type: "primary",
          iconClass: "fas fa-chart-pie",
          title: "Analysis",
          text: `You have ${convertNumberToCurrency(personalSpendingBudgetLeft)} remaining in "${personalSpendingBudget.Name}".`
        };
        setInsights(previousInsights=>[...previousInsights, insight]);
      }
    });
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

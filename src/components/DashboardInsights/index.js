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
    const incomeExpected = getSumByProp(budgetCycleBudgets.filter(budgetData=>budgetData.Name.match(/payroll/i)), "Amount");
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

    /* Check what bills are yet to be paid */
    const unpaidBudgets = budgetCycleBudgetsWithSpent.filter(budgetWithSpent=>budgetWithSpent.Type === "bill" && !budgetWithSpent.Spent);
    if (unpaidBudgets.length) {
      const insight = {
        type: "info",
        iconClass: "fas fa-info",
        title: "Remaining Bills",
        text: `There ${unpaidBudgets.length === 1 ? "is" : "are"} ${unpaidBudgets.length} bill${unpaidBudgets.length === 1 ? '' : "s"} totalling ${convertNumberToCurrency(Math.abs(getSumByProp(unpaidBudgets, "Amount")))} remaining for this month: ${unpaidBudgets.map(b=>`${b.Name} (${convertNumberToCurrency(Math.abs(b.Amount))})`).join(", ")}`
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
        text: `You are overspent on ${budgetsOver.length} non-bill budget${budgetsOver.length === 1 ? '' : "s"}: ${budgetsOver.map(b=>`${b.Name} (+${convertNumberToCurrency(b.Amount-b.Spent)})`).join(", ")}`
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
    const overspentBillsWithSpent = budgetCycleBudgetsWithSpent.filter(budgetWithSpent=>budgetWithSpent.Type === "bill" && Math.abs(budgetWithSpent.Spent) > Math.abs(budgetWithSpent.Amount));
    if (overspentBillsWithSpent.length) {
      overspentBillsWithSpent.forEach(overspentBillWithSpent=>{
        const budgetSpentAmount = Math.abs(overspentBillWithSpent.Spent);
        const budgetBudgetedAmount = Math.abs(overspentBillWithSpent.Amount);
        const overspentPercentage = (budgetSpentAmount-budgetBudgetedAmount)/budgetBudgetedAmount*100;
        
        const insight = {
          type: "warning",
          iconClass: "fas fa-chart-bar",
          title: "Higher Bill",
          text: `Bill ${overspentBillWithSpent.Name} has gone up ${convertNumberToCurrency(budgetSpentAmount-budgetBudgetedAmount)} (${overspentPercentage >= 0 && "+"}${overspentPercentage.toFixed(1)}%).`
        };
        console.log(overspentBillWithSpent)
        setInsights(previousInsights=>[...previousInsights, insight]);
      });
    }

    /* Check for budgets with no budgeted amount that were still spent from */
    const emptySpentBudgets = budgetCycleBudgetsWithSpent.filter(budgetWithSpent=>budgetWithSpent.Amount === 0 && budgetWithSpent.Spent !== 0 && budgetWithSpent.Name !== "Miscellaneous");
    console.log("emptyBudgets", emptySpentBudgets);
    if (emptySpentBudgets.length) {
      const insight = {
        type: "warning",
        iconClass: "fas fa-question",
        title: "Empty Budget Spending",
        text: `You have spent ${convertNumberToCurrency(Math.abs(getSumByProp(emptySpentBudgets, "Spent")))} in ${emptySpentBudgets.length} budget${emptySpentBudgets.length === 1 ? '' : "s"} that had no budgeted amount: ${emptySpentBudgets.map(b=>`${b.Name} (${convertNumberToCurrency(b.Amount-b.Spent)})`).join(", ")}`
      };
      setInsights(previousInsights=>[...previousInsights, insight]);
    }

    /* Check for miscellaneous or uncategorized transactions */
    const miscellaneousBudget = budgetCycleBudgetsWithSpent.find(budgetWithSpent=>budgetWithSpent.Name === "Miscellaneous");
    const miscellaneousTransactionGroups = miscellaneousBudget.Transactions.reduce((acc, t)=>({...acc, [t.DescriptionDisplay]: {Amount: (acc[t.DescriptionDisplay]?.Amount || 0)+t.Amount, Count: (acc[t.DescriptionDisplay]?.Count || 0)+1}}), {});
    console.log(miscellaneousTransactionGroups);
    if (miscellaneousBudget && miscellaneousBudget.Spent) {
      const insight = {
        type: "warning",
        iconClass: "fas fa-list",
        title: "Miscellaneous",
        text: `You have spent ${convertNumberToCurrency(Math.abs(miscellaneousBudget.Spent))} on ${miscellaneousBudget.Transactions.length} uncategorized item${miscellaneousBudget.Transactions.length === 1 ? '' : "s"}: ${Object.entries(miscellaneousTransactionGroups).sort(([, aValue], [, bValue])=>(bValue > aValue ? -1 : (aValue < bValue ? 1 : 0))).map(([key, value])=>`${key} (${value.Count}): ${convertNumberToCurrency(Math.abs(value.Amount))}`).join(", ")}`
      };
      setInsights(previousInsights=>[...previousInsights, insight]);
    }

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
    console.log("test", budgetCycleBudgetsWithSpent
    .filter(b=>b.Type==="bill" && b.Spent!==0)
      .map(b=>`${b.Name}: ${(b.Amount-b.Spent)*-1}`));
    const remainingFlexibleSpendingMoney = totalIncome + totalExpenses + leftoverPaidBillsMoney + remainingBillsToBePaid + remainingSavingsToBeSaved;
    console.log(remainingFlexibleSpendingMoney, totalIncome, totalExpenses, leftoverPaidBillsMoney, remainingBillsToBePaid, remainingSavingsToBeSaved)
    const flexibleMoneyBreakdown = ` (${convertNumberToCurrency(remainingBillsToBePaid*-1)} in remaining bills, ${leftoverPaidBillsMoney >= 0 ? "+" : ''}${convertNumberToCurrency(leftoverPaidBillsMoney)} left over from bills, ${convertNumberToCurrency(remainingSavingsToBeSaved*-1)} left to be saved)`;
    if (remainingFlexibleSpendingMoney > 0) {
      const insight = {
        type: "primary",
        iconClass: "fas fa-chart-line",
        title: "Projection",
        text: `You have ${convertNumberToCurrency(remainingFlexibleSpendingMoney)} of flexible money remaining ${flexibleMoneyBreakdown}`
      };
      setInsights(previousInsights=>[...previousInsights, insight]);
    }
    else {
      const insight = {
        type: "warning",
        iconClass: "fas fa-chart-line",
        title: "Projection",
        text: `You are ${convertNumberToCurrency(remainingFlexibleSpendingMoney)} in the negative of "flexible" money ${flexibleMoneyBreakdown}`
      };
      setInsights(previousInsights=>[...previousInsights, insight]);
    }

    /* Check if there is money left to put into Savings */
    const savingsBudgetsWithRemainingMoney = budgetCycleBudgetsWithSpent.filter(budgetWithSpent=>budgetWithSpent.Name === "Savings" && Math.abs(budgetWithSpent.Spent) < Math.abs(budgetWithSpent.Amount));
    if (savingsBudgetsWithRemainingMoney.length) {
      savingsBudgetsWithRemainingMoney.forEach(savingsBudget=>{
          const insight = {
            type: "primary",
            iconClass: "fas fa-chart-pie",
            title: "Analysis",
            text: `You have ${convertNumberToCurrency(Math.abs(savingsBudget.Amount-savingsBudget.Spent))} more budgeted to put into ${savingsBudget.Name}.`
          };
          setInsights(previousInsights=>[...previousInsights, insight]);
        });
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

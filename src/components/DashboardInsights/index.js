import {useState, useEffect} from 'react';

import DashboardInsight from './../DashboardInsight';
import {getSumByProp, convertNumberToCurrency, getBudgetTransactions, getBudgetAmountSpentFromTransactions} from './../../utilities';

import './index.scss';

const DashboardInsights = ({ budgetCycle, budgetCycleTransactions, budgetCycleBudgets, totalIncome, totalExpenses, remainingBillsToBePaid, remainingBillsToBePaidTotal, leftoverPaidBills, leftoverPaidBillsTotal, remainingSavingsToBeSaved, remainingSavingsToBeSavedTotal, remainingGiving, remainingGivingTotal, remainingFlexibleSpendingMoney, isCurrentBudgetCycle, isPastBudgetCycle, isFutureBudgetCycle })=>{
  const [insights, setInsights] = useState([]);

  const runInsights = ()=>{
    if (![...budgetCycleTransactions.all, ...budgetCycleTransactions.previous].length || !budgetCycleBudgets.length) return;

    //First, remove all insights
    setInsights([]);

    //Declare variables
    const totalIncomeEarnedAmount = getSumByProp(budgetCycleBudgets.filter(budgetData=>budgetData.Type==="income"), "BudgetCycleSpent")
    const totalIncomeBudgetedAmount = getSumByProp(budgetCycleBudgets.filter(budgetData=>budgetData.Type==="income"), "BudgetCycleAmount");
    const totalExpensesBudgetedAmount = getSumByProp(budgetCycleBudgets.filter(budgetData=>budgetData.Type!=="income"), "BudgetCycleAmount");
    const incomeUnderEarned = (totalIncomeEarnedAmount - totalIncomeBudgetedAmount)*-1;
    const incomeShortOfExpenses = (totalIncomeEarnedAmount + /*-*/totalExpensesBudgetedAmount);
      
    // const flexibleMoneyBreakdown = `${convertNumberToCurrency(totalIncome + totalExpenses)} remaining this month, ${convertNumberToCurrency(remainingBillsToBePaidTotal)} in remaining bills, ${leftoverPaidBillsTotal >= 0 ? "+" : ''}${convertNumberToCurrency(leftoverPaidBillsTotal)} ${leftoverPaidBillsTotal >= 0 ? "left over from" : 'overpaid on'} bills, ${convertNumberToCurrency(remainingSavingsToBeSavedTotal)} ${remainingSavingsToBeSavedTotal <= 0 ? "left to be saved" : "over-saved"}, ${convertNumberToCurrency(remainingGivingTotal)} ${remainingGivingTotal <= 0 ? "left to give" : "over-gave"}`;
    const flexibleMoneyBreakdown = `${convertNumberToCurrency(totalIncome + totalExpenses)} remaining this month, ${convertNumberToCurrency(remainingBillsToBePaidTotal)} in remaining bills, ${convertNumberToCurrency(remainingSavingsToBeSavedTotal)} ${remainingSavingsToBeSavedTotal <= 0 ? "left to be saved" : "over-saved"}, ${convertNumberToCurrency(remainingGivingTotal)} ${remainingGivingTotal <= 0 ? "left to give" : "over-gave"}`;
    
    /* Check if less was earned for this month than expected */
    if (incomeUnderEarned > 0) {
      const insight = {
        type: "danger",
        iconClass: "fas fa-exclamation",
        title: `Income ${incomeShortOfExpenses >= 0 ? "Over" : "Under"} Budget`,
        text: `You have under-earned ${convertNumberToCurrency(incomeUnderEarned)} of ${convertNumberToCurrency(totalIncomeBudgetedAmount)} expected income for this month.`
      };
      setInsights(previousInsights=>[...previousInsights, insight]);
    }

    {
      /* Check if less was earned for this month than budgeted for */
      const insight = {
        type: (incomeShortOfExpenses >= 0 ? "success" : "danger"),
        iconClass: (incomeShortOfExpenses >= 0 ? "fas fa-check" : "fas fa-exclamation"),
        title: `${incomeShortOfExpenses >= 0 ? "High" : "Low"} Income`,
        text: `You have ${incomeShortOfExpenses >= 0 ? "over" : "under"}-earned ${convertNumberToCurrency(Math.abs(incomeShortOfExpenses))} of ${convertNumberToCurrency(Math.abs(totalExpensesBudgetedAmount))} budgeted expenses for this month.`
      };
      setInsights(previousInsights=>[...previousInsights, insight]);
    }

    {
      /* Check what bills are yet to be paid */
      const unpaidBills = budgetCycleBudgets.filter(budget=>budget.Type === "bill" && !budget.Spent);
      if (unpaidBills.length) {
        const insight = {
          type: "info",
          iconClass: "fas fa-info",
          title: "Remaining Bills",
          text: `There ${unpaidBills.length === 1 ? "is" : "are"} ${unpaidBills.length} bill${unpaidBills.length === 1 ? '' : "s"} totalling ${convertNumberToCurrency(Math.abs(getSumByProp(unpaidBills, "Amount")))} remaining for this month: ${unpaidBills.map(b=>`${b.Name} (${convertNumberToCurrency(Math.abs(b.Amount))})`).join(", ")}`
        };
        setInsights(previousInsights=>[...previousInsights, insight]);
      }
    }

    /* Check if the user is over on any non-bill budgets */
    const budgetsOver = budgetCycleBudgets.filter(budgetData=>!["income","savings","bill"].includes(budgetData.Type) && budgetData.Name !== "Miscellaneous" && budgetData.Spent < budgetData.Amount);
    const overAmount = getSumByProp(budgetsOver, "Amount") - getSumByProp(budgetsOver, "Spent");
    //const overAmount = budgetsOver.reduce(b=>`${b.Name} (+${convertNumberToCurrency(b.Amount-b.Spent)})`).join(", ");
    if (budgetsOver.length) {
      const insight = {
        type: "danger",
        iconClass: "fas fa-exclamation",
        title: "Overspending",
        text: `You overspent ${convertNumberToCurrency(overAmount)} on ${budgetsOver.length} non-bill budget${budgetsOver.length === 1 ? '' : "s"}: ${budgetsOver.map(b=>`${b.Name} (+${convertNumberToCurrency(b.Amount-b.Spent)})`).join(", ")}`
      };
      setInsights(previousInsights=>[...previousInsights, insight]);
    }

    /* Check if any bills were unpaid */
    const unpaidBills = budgetCycleBudgets.filter(budget=>budget.Type === "bill" && !budget.Spent && Number(budget.DueDate?.match(/[0-3]?[0-9](?=st|nd|rd|th)/)[0]) < new Date().getDate());
    if (unpaidBills.length) {
      unpaidBills.forEach(unpaidBill=>{
        const insight = {
          type: "danger",
          iconClass: "fas fa-exclamation",
          title: "Late Bill",
          text: `You haven't paid bill ${unpaidBill.Name} (${convertNumberToCurrency(Math.abs(unpaidBill.Amount)-Math.abs(unpaidBill.Spent))} due every ${unpaidBill.DueDate}).`
        };
        console.log(unpaidBill)
        setInsights(previousInsights=>[...previousInsights, insight]);
      });
    }

    /* Check if any bills were overpaid */
    const overspentBills = budgetCycleBudgets.filter(budget=>budget.Type === "bill" && Math.abs(budget.Spent) > Math.abs(budget.Amount));
    if (overspentBills.length) {
      overspentBills.forEach(overspentBill=>{
        const budgetSpentAmount = Math.abs(overspentBill.Spent);
        const budgetBudgetedAmount = Math.abs(overspentBill.Amount);
        const overspentPercentage = (budgetSpentAmount-budgetBudgetedAmount)/budgetBudgetedAmount*100;
        
        const insight = {
          type: "warning",
          iconClass: "fas fa-chart-bar",
          title: "Higher Bill",
          text: `Bill ${overspentBill.Name} has gone up ${convertNumberToCurrency(budgetSpentAmount-budgetBudgetedAmount)} (${overspentPercentage >= 0 && "+"}${overspentPercentage.toFixed(1)}%).`
        };
        console.log(overspentBill)
        setInsights(previousInsights=>[...previousInsights, insight]);
      });
    }

    /* Check for budgets with no budgeted amount that were still spent from */
    const emptySpentBudgets = budgetCycleBudgets.filter(budget=>budget.Amount === 0 && budget.Spent !== 0 && budget.Name !== "Miscellaneous");
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
    const miscellaneousBudget = budgetCycleBudgets.find(budget=>budget.Name === "Miscellaneous");
    if (miscellaneousBudget) {
      const miscellaneousTransactionGroups = miscellaneousBudget.Transactions.reduce((acc, t)=>({...acc, [t.DescriptionDisplay ?? t.Description]: {Amount: (acc[t.DescriptionDisplay ?? t.Description]?.Amount || 0)+t.Amount, Count: (acc[t.DescriptionDisplay ?? t.Description]?.Count || 0)+1}}), {});
      console.log(miscellaneousTransactionGroups);
      if (miscellaneousBudget.Spent) {
        const insight = {
          type: "warning",
          iconClass: "fas fa-list",
          title: "Miscellaneous",
          text: `You have spent ${convertNumberToCurrency(Math.abs(miscellaneousBudget.Spent))} on ${miscellaneousBudget.Transactions.length} uncategorized item${miscellaneousBudget.Transactions.length === 1 ? '' : "s"}: ${Object.entries(miscellaneousTransactionGroups).sort(([, aValue], [, bValue])=>(bValue > aValue ? -1 : (aValue < bValue ? 1 : 0))).map(([key, value])=>`${key} (${value.Count}): ${convertNumberToCurrency(Math.abs(value.Amount))}`).join(", ")}`
        };
        setInsights(previousInsights=>[...previousInsights, insight]);
      }
    }


    /* Check how much money flexible money is left this budget cycle */
    if (remainingFlexibleSpendingMoney > 0) {
      const insight = {
        type: "info",
        iconClass: "fas fa-chart-line",
        title: "Month End Projection",
        text: `You ${isPastBudgetCycle ? "ended the month with " : "are projected to have "} ${convertNumberToCurrency(remainingFlexibleSpendingMoney)} of flexible money remaining${isPastBudgetCycle ? " projected" : ""}: ${flexibleMoneyBreakdown}`
      };
      setInsights(previousInsights=>[...previousInsights, insight]);
    }
    else {
      const insight = {
        type: "warning",
        iconClass: "fas fa-chart-line",
        title: "Month End Projection",
        text: `You ${isPastBudgetCycle ? "ended the month with " : "are projected to have "} negative ${convertNumberToCurrency(remainingFlexibleSpendingMoney)}${isPastBudgetCycle ? " projected" : ""}: ${flexibleMoneyBreakdown}`
      };
      setInsights(previousInsights=>[...previousInsights, insight]);
    }

    /* Check if there is money left to put into Savings */
    const savingsBudgetsWithRemainingMoney = budgetCycleBudgets.filter(budget=>budget.Name === "Savings" && Math.abs(budget.Spent) < Math.abs(budget.Amount));
    if (savingsBudgetsWithRemainingMoney.length) {
      savingsBudgetsWithRemainingMoney.forEach(savingsBudget=>{
          const insight = {
            type: "info",
            iconClass: "fas fa-piggy-bank",
            title: "Savings",
            text: `You have ${convertNumberToCurrency(Math.abs(savingsBudget.Amount-savingsBudget.Spent))} more budgeted to put into ${savingsBudget.Name}.`
          };
          setInsights(previousInsights=>[...previousInsights, insight]);
        });
    }

    /* Check if there is money left to Give */
    const givingBudgetsWithRemainingMoney = budgetCycleBudgets.filter(budget=>budget.Group === "Giving" && Math.abs(budget.Spent) < Math.abs(budget.Amount));
    if (givingBudgetsWithRemainingMoney.length) {
      givingBudgetsWithRemainingMoney.forEach(givingBudget=>{
          const insight = {
            type: "info",
            iconClass: "fas fa-hand-holding-usd",
            title: "Giving",
            text: `You have ${convertNumberToCurrency(Math.abs(givingBudget.Amount-givingBudget.Spent))} more budgeted to give to ${givingBudget.Name}.`
          };
          setInsights(previousInsights=>[...previousInsights, insight]);
        });
    }

    /* Check if there is money left in the "Personal Spending" or "Bradley" budget */
    const personalSpendingBudgets = budgetCycleBudgets.filter(budgetData=>["Personal Spending", "Bradley", "Sarah"].includes(budgetData.Name));
    personalSpendingBudgets.forEach(personalSpendingBudget=>{
      const personalSpendingBudgetLeft = getBudgetAmountSpentFromTransactions(personalSpendingBudget.Name, [...budgetCycleTransactions.all, ...budgetCycleTransactions.previous]) - personalSpendingBudget.Amount;
      if (personalSpendingBudgetLeft > 0) {
        const insight = {
          type: "info",
          iconClass: "fas fa-user",
          title: "Personal",
          text: `You have ${convertNumberToCurrency(personalSpendingBudgetLeft)} of personal spending remaining for "${personalSpendingBudget.Name}".`
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

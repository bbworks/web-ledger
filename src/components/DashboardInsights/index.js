import {useState, useEffect} from 'react';

import DashboardInsight from './../DashboardInsight';
import {convertNumberToCurrency, getBudgetAmountSpentFromTransactions} from './../../utilities';

import './index.scss';

const DashboardInsights = ({ transactions, budgetsData })=>{
  const [insights, setInsights] = useState([]);

  const runInsights = ()=>{
    //First, remove all insights
    setInsights([]);

    /* Check if there is money left in the "Personal Spending" budget */
    const personalSpendingBudgetData = budgetsData.find(budgetData=>budgetData.name==="Personal Spending");
    const personalSpendingBudgetLeft = getBudgetAmountSpentFromTransactions("Personal Spending", transactions) - personalSpendingBudgetData.amount;
    if (personalSpendingBudgetLeft > 0) {
      const insight = {
        type: "primary",
        title: "Insights",
        text: `You have ${convertNumberToCurrency(personalSpendingBudgetLeft)} left in \"Personal Spending\".`
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
    const bills = budgetsData.filter(budgetData=>budgetData.type==="bill");
    bills.forEach(bill=>{
      const amountSpent = getBudgetAmountSpentFromTransactions(bill.name, transactions)
      if (!amountSpent) return;
      if (Math.abs(amountSpent) > Math.abs(bill.amount)) {
        const insight = {
          type: "warning",
          title: "Insights",
          text: `Bill "${bill.name}" has gone up ${convertNumberToCurrency(Math.abs(amountSpent)-Math.abs(bill.amount))}.`
        };
        setInsights(previousInsights=>[...previousInsights, insight]);
      }
    });
  };

  useEffect(()=>{
    runInsights();
  }, [transactions, budgetsData]);

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

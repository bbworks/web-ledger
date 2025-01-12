import {useEffect} from 'react';
import {useLocation} from 'react-router-dom';

import './index.scss';

import DashboardTop from './../DashboardTop';
import DashboardInsights from './../DashboardInsights';
import DashboardShowcase from './../DashboardShowcase';

import {getSumByProp, getBudgetCycleFromDate} from './../../utilities';


const DashboardView = ({ signedInUser, transactions, accountsData, accountData, budgetsData, budgetCycle, allBudgetCycles, budgetCycleBudgets, budgetCycleTransactions, onBudgetCycleChange, setFooterNavbar })=>{
  //Send the route to the footer navbar
  const route = useLocation().pathname;
  useEffect(()=>{
    setFooterNavbar(route);
  }, [route]);

  const totalIncome = getSumByProp(budgetCycleTransactions.income, "Amount");
  const totalExpenses = getSumByProp(budgetCycleTransactions.expenses, "Amount");
  
  const isCurrentBudgetCycle = budgetCycle.getTime() === getBudgetCycleFromDate(new Date()).getTime();
  const isPastBudgetCycle = budgetCycle.getTime() < getBudgetCycleFromDate(new Date()).getTime();
  const isFutureBudgetCycle = budgetCycle.getTime() > getBudgetCycleFromDate(new Date()).getTime();
  
  /* filter to only bills that have NOT been paid */
  const remainingBillsToBePaid = budgetCycleBudgets.filter(b=>b.Type==="bill" && b.Spent===0);
  const remainingBillsToBePaidTotal = getSumByProp(remainingBillsToBePaid, "Amount") - getSumByProp(remainingBillsToBePaid, "Spent");  /* Return the inverse (negative is surplus) */
  /* filter to only leftover money from bills that have been paid */
  const leftoverPaidBills = budgetCycleBudgets.filter(b=>b.Type==="bill" && b.BudgetCycleSpent!==0 && (b.BudgetCycleAmount - b.BudgetCycleSpent) !== 0);
  const leftoverPaidBillsTotal = (getSumByProp(leftoverPaidBills, "BudgetCycleAmount") - getSumByProp(leftoverPaidBills, "BudgetCycleSpent")) * -1;
  /* filter to only savings */
  const remainingSavingsToBeSaved = budgetCycleBudgets.filter(b=>b.Type==="savings");
  const remainingSavingsToBeSavedTotal = getSumByProp(remainingSavingsToBeSaved, "Amount") - getSumByProp(remainingSavingsToBeSaved, "Spent");  /* Return the inverse (negative is surplus) */
  /* filter to only giving */
  const remainingGiving = budgetCycleBudgets.filter(b=>b.Group==="Giving");
  const remainingGivingTotal = getSumByProp(remainingGiving, "Amount") - getSumByProp(remainingGiving, "Spent");  /* Return the inverse (negative is surplus) */
  
  const remainingFlexibleSpendingMoney = totalIncome + totalExpenses + remainingBillsToBePaidTotal + /*leftoverPaidBillsTotal +*/ remainingSavingsToBeSavedTotal + remainingGivingTotal;
  console.log("BudgeCyclet status:", 
"\n  totalIncome:", totalIncome,
"\n  totalExpenses:", totalExpenses,
"\n  totalIncome-totalExpenses:", totalIncome+totalExpenses,
// "\n  remainingFlexibleSpendingMoney:", remainingFlexibleSpendingMoney,
"\n  remainingBillsToBePaid:", remainingBillsToBePaidTotal, remainingBillsToBePaid,
"\n  leftoverPaidBills:", leftoverPaidBillsTotal, leftoverPaidBills,
"\n  remainingSavingsToBeSaved:", remainingSavingsToBeSavedTotal, remainingSavingsToBeSaved,
"\n  remainingGiving:", remainingGivingTotal, remainingGiving)
  
  return (
    <div className="view dashboard-view d-flex flex-column">
      <main className="main flex-grow-1">
        <DashboardTop transactions={transactions} accountsData={accountsData} accountData={accountData} budgetCycle={budgetCycle} allBudgetCycles={allBudgetCycles} budgetCycleTransactions={budgetCycleTransactions} onBudgetCycleChange={onBudgetCycleChange} />
        <DashboardShowcase budgetCycle={budgetCycle} budgetCycleTransactions={budgetCycleTransactions} budgetCycleBudgets={budgetCycleBudgets} totalIncome={totalIncome} totalExpenses={totalExpenses} remainingBillsToBePaid={remainingBillsToBePaid} remainingBillsToBePaidTotal={remainingBillsToBePaidTotal} leftoverPaidBills={leftoverPaidBills} leftoverPaidBillsTotal={leftoverPaidBillsTotal} remainingSavingsToBeSaved={remainingSavingsToBeSaved} remainingSavingsToBeSavedTotal={remainingSavingsToBeSavedTotal} remainingGiving={remainingGiving} remainingGivingTotal={remainingGivingTotal} remainingFlexibleSpendingMoney={remainingFlexibleSpendingMoney} isCurrentBudgetCycle={isCurrentBudgetCycle} isPastBudgetCycle={isPastBudgetCycle} isFutureBudgetCycle={isFutureBudgetCycle} />
        <DashboardInsights budgetCycle={budgetCycle} budgetCycleTransactions={budgetCycleTransactions} budgetCycleBudgets={budgetCycleBudgets} totalIncome={totalIncome} totalExpenses={totalExpenses} remainingBillsToBePaid={remainingBillsToBePaid} remainingBillsToBePaidTotal={remainingBillsToBePaidTotal} leftoverPaidBills={leftoverPaidBills} leftoverPaidBillsTotal={leftoverPaidBillsTotal} remainingSavingsToBeSaved={remainingSavingsToBeSaved} remainingSavingsToBeSavedTotal={remainingSavingsToBeSavedTotal} remainingGiving={remainingGiving} remainingGivingTotal={remainingGivingTotal} remainingFlexibleSpendingMoney={remainingFlexibleSpendingMoney} isCurrentBudgetCycle={isCurrentBudgetCycle} isPastBudgetCycle={isPastBudgetCycle} isFutureBudgetCycle={isFutureBudgetCycle} />
      </main>
    </div>
  );
};

export default DashboardView;

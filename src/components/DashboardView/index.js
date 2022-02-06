import {useEffect} from 'react';
import {useLocation} from 'react-router-dom';

import {useBudgetCycleTransactions, useBudgetCycleBudgets} from './../../hooks';

import './index.scss';

import DashboardTop from './../DashboardTop';
import DashboardContent from './../DashboardContent';

const DashboardView = ({ signedInUser, transactions, accountsData, accountData, budgetsData, budgetCycle, allBudgetCycles, onBudgetCycleChange, setFooterNavbar })=>{
  //Send the route to the footer navbar
  const route = useLocation().pathname;
  useEffect(()=>{
    setFooterNavbar(route);
  }, [route]);

  const budgetCycleTransactions = useBudgetCycleTransactions(transactions, budgetCycle);
  const budgetCycleBudgets = useBudgetCycleBudgets(budgetsData, budgetCycle);

  return (
    <div className="view dashboard-view d-flex flex-column">
      <main className="main flex-grow-1">
        <DashboardTop transactions={transactions} accountsData={accountsData} accountData={accountData} budgetCycle={budgetCycle} allBudgetCycles={allBudgetCycles} onBudgetCycleChange={onBudgetCycleChange} />
        <DashboardContent budgetCycle={budgetCycle} budgetCycleTransactions={budgetCycleTransactions} budgetCycleBudgets={budgetCycleBudgets} />
      </main>
    </div>
  );
};

export default DashboardView;

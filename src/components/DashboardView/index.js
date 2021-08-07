import {useEffect} from 'react';
import {useLocation} from 'react-router-dom';

import {useBudgetCycleTransactions} from './../../hooks';

import './index.scss';

import DashboardTop from './../DashboardTop';
import DashboardContent from './../DashboardContent';

const DashboardView = ({ signedInUser, transactions, accountsData, accountData, budgetsData, budgetCycle, onBudgetCycleChange, setFooterNavbar })=>{
  //Send the route to the footer navbar
  const route = useLocation().pathname;
  useEffect(()=>{
    setFooterNavbar(route);
  }, []);

  const currentBudgetCycleTransactions = useBudgetCycleTransactions(transactions, budgetCycle);

  return (
    <div className="view dashboard-view d-flex flex-column">
      <main className="main flex-grow-1">
        <DashboardTop transactions={transactions} accountsData={accountsData} accountData={accountData} budgetCycle={budgetCycle} onBudgetCycleChange={onBudgetCycleChange} />
        <DashboardContent transactions={currentBudgetCycleTransactions} budgetsData={budgetsData} />
      </main>
    </div>
  );
};

export default DashboardView;

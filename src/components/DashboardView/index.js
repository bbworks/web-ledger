import {useEffect} from 'react';
import {useLocation} from 'react-router-dom';

import {useBudgetCycleTransactions} from './../../hooks';

import './index.scss';

import DashboardHeader from './../DashboardHeader';
import DashboardTop from './../DashboardTop';
import DashboardContent from './../DashboardContent';

const DashboardView = ({ signedInUser, transactions, accountsData, accountData, budgetsData, budgetCycle, setFooterNavbar })=>{
  //Send the route to the footer navbar
  const route = useLocation().pathname;
  useEffect(()=>{
    setFooterNavbar(route);
  }, []);

  const currentBudgetCycleTransactions = useBudgetCycleTransactions(transactions, budgetCycle);

  return (
    <div className="view dashboard-view d-flex flex-column">
      <DashboardHeader signedInUser={signedInUser} />
      <main className="main flex-grow-1">
        <DashboardTop accountsData={accountsData} accountData={accountData} budgetCycle={budgetCycle} />
        <DashboardContent transactions={currentBudgetCycleTransactions} budgetsData={budgetsData} />
      </main>
    </div>
  );
};

export default DashboardView;

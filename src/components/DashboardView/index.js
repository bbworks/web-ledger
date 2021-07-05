import './index.scss';

import DashboardHeader from './../DashboardHeader';
import DashboardTop from './../DashboardTop';
import DashboardContent from './../DashboardContent';

const DashboardView = ({ transactions, accountsData, accountData, budgetsData, budgetCycle })=>{
  return (
    <div className="view dashboard-view d-flex flex-column">
      <DashboardHeader />
      <main className="main flex-grow-1">
        <DashboardTop accountsData={accountsData} accountData={accountData} budgetCycle={budgetCycle} />
        <DashboardContent transactions={transactions} budgetsData={budgetsData} />
      </main>
    </div>
  );
};

export default DashboardView;

import DashboardInsights from './../DashboardInsights';
import DashboardShowcase from './../DashboardShowcase';

import './index.scss';

const DashboardContent = ({ budgetCycle, budgetCycleTransactions, budgetsData })=>{
  return (
    <div className="dashboard-content container-fluid overflow-auto">
      <DashboardShowcase budgetCycle={budgetCycle} budgetCycleTransactions={budgetCycleTransactions} budgetsData={budgetsData} />
      <DashboardInsights budgetCycle={budgetCycle} budgetCycleTransactions={budgetCycleTransactions} budgetsData={budgetsData} />
    </div>
  );
};

export default DashboardContent;

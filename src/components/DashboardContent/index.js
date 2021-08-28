import DashboardInsights from './../DashboardInsights';
import DashboardShowcase from './../DashboardShowcase';

import './index.scss';

const DashboardContent = ({ budgetCycleTransactions, budgetsData })=>{
  return (
    <div className="dashboard-content container-fluid overflow-auto">
      <DashboardShowcase />
      <DashboardInsights budgetCycleTransactions={budgetCycleTransactions} budgetsData={budgetsData} />
    </div>
  );
};

export default DashboardContent;

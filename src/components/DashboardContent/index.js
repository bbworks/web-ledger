import DashboardInsights from './../DashboardInsights';
import DashboardShowcase from './../DashboardShowcase';

import './index.scss';

const DashboardContent = ({ budgetCycle, budgetCycleTransactions, budgetCycleBudgets })=>{
  return (
    <div className="dashboard-content container-fluid overflow-auto">
      <DashboardShowcase budgetCycle={budgetCycle} budgetCycleTransactions={budgetCycleTransactions} budgetCycleBudgets={budgetCycleBudgets} />
      <DashboardInsights budgetCycle={budgetCycle} budgetCycleTransactions={budgetCycleTransactions} budgetCycleBudgets={budgetCycleBudgets} />
    </div>
  );
};

export default DashboardContent;

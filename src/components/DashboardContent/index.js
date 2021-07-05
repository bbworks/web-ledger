import DashboardInsights from './../DashboardInsights';
import DashboardShowcase from './../DashboardShowcase';

import './index.scss';

const DashboardContent = ({ transactions, budgetsData })=>{
  return (
    <div className="dashboard-content container-fluid overflow-auto">
      <DashboardShowcase transactions={transactions} budgetsData={budgetsData} />
      <DashboardInsights transactions={transactions} budgetsData={budgetsData} />
    </div>
  );
};

export default DashboardContent;

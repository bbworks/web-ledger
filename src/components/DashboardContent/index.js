import DashboardInsights from './../DashboardInsights';
import DashboardShowcase from './../DashboardShowcase';

import './index.scss';

const DashboardContent = ()=>{
  return (
    <div className="dashboard-content container-fluid overflow-auto">
      <DashboardShowcase />
      <DashboardInsights />
    </div>
  );
};

export default DashboardContent;

import DashboardOverview from './../DashboardOverview';
import DashboardShowcase from './../DashboardShowcase';

import './index.scss';

const DashboardContent = ()=>{
  return (
    <div className="dashboard-content container-fluid overflow-auto">
      <DashboardShowcase />
      <DashboardOverview />
    </div>
  );
};

export default DashboardContent;

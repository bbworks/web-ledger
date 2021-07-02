import './index.scss';

import DashboardHeader from './../DashboardHeader';
import DashboardTop from './../DashboardTop';
import DashboardContent from './../DashboardContent';

const DashboardView = ({ transactions })=>{
  return (
    <div className="view dashboard-view d-flex flex-column">
      <DashboardHeader />
      <main className="main flex-grow-1">
        <DashboardTop />
        <DashboardContent />
      </main>
    </div>
  );
};

export default DashboardView;

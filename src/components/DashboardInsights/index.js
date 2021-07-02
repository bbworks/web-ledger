import DashboardInsight from './../DashboardInsight';

import './index.scss';

const DashboardInsights = ()=>{
  return (
    <div className="dashboard-insights container mt-5">
      <h2 className="text-center mb-4">Insights</h2>
      <DashboardInsight insight={{type: "primary", iconClass: "fas fa-sliders-h", title: "Insights", text: "You have money left in \"Personal Spending\"."}} />
      <DashboardInsight insight={{type: "danger", iconClass: "fas fa-sliders-h", title: "Insights", text: "You've spent $40 more than last month."}} />
      <DashboardInsight insight={{type: "warning", iconClass: "fas fa-sliders-h", title: "Insights", text: "Bill \"AT&T Internet\" has gone up."}} />
    </div>
  );
};

export default DashboardInsights;

import './index.scss';

const DashboardInsight = ({ insight })=>{
  let insightTypeIconClass = insight.insightTypeIconClass;
  if (!insightTypeIconClass) {
    if (insight.type === "primary") {
      insightTypeIconClass = "fas fa-xs fa-info-circle";
    }
    else if (insight.type === "success") {
      insightTypeIconClass = "fas fa-xs fa-check-circle";
    }
    else if (insight.type === "warning") {
      insightTypeIconClass = "fas fa-xs fa-exclamation-triangle";
    }
    else if (insight.type === "danger") {
      insightTypeIconClass = "fas fa-xs fa-times-circle";
    }
  }

  return (
    <div className={`dashboard-insight alert-${insight.type}`}>
      <div>
        <i className={`${insight.iconClass ?? "fas fa-sliders-h"} me-1`}></i>
        <h3 className="d-inline-block">{insight.title}</h3>
      </div>
      <i className={`${insightTypeIconClass} me-1`}></i>
      <span>{insight.text}</span>
    </div>
  );
};

export default DashboardInsight;

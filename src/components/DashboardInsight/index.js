import './index.scss';

const DashboardInsight = ({ insight })=>{
  let iconClass = insight.iconClass;
  if (!iconClass) {
    if (insight.type === "primary") {
      iconClass = "fas fa-xs fa-info-circle";
    }
    else if (insight.type === "success") {
      iconClass = "fas fa-xs fa-check-circle";
    }
    else if (insight.type === "warning") {
      iconClass = "fas fa-xs fa-exclamation-triangle";
    }
    else if (insight.type === "danger") {
      iconClass = "fas fa-xs fa-times-circle";
    }
  }

  return (
    <div className={`dashboard-insight alert alert-${insight.type}`}>
      <div>
        <i className={"fas fa-sliders-h me-1"}></i>
        <h3 className="d-inline-block">{insight.title}</h3>
      </div>
      <i className={`${iconClass} me-1`}></i>
      <span>{insight.text}</span>
    </div>
  );
};

export default DashboardInsight;

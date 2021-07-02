import './index.scss';

const DashboardInsight = ({ insight })=>{
  return (
    <div className={`dashboard-insight alert alert-${insight.type}`}>
      <div>
        <i className={`${insight.iconClass} me-1`}></i>
        <h3 className="d-inline-block">{insight.title}</h3>
      </div>
      <span>{insight.text}</span>
    </div>
  );
};

export default DashboardInsight;

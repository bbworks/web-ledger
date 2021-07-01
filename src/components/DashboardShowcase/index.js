import './index.scss';

const DashboardShowcase = ()=>{
  return (
    <div className="dashboard-showcase container d-flex flex-column justify-content-center align-items-center bg-primary text-light my-3 mx-auto">
      <i className="fas fa-check-circle fa-2x mb-4"></i>
      <h3 className="fw-bold h2">All good!</h3>
      <span className="h6">You are on track for this month.</span>
    </div>
  );
};

export default DashboardShowcase;

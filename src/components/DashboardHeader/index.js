import './index.scss';

const DashboardHeader = ()=>{
  return (
    <header className="dashboard-header navbar-text">
      <div className="container d-flex justify-content-between">
        <a className="navbar-brand d-flex align-items-center" href="/">
          <i className="dashboard-header-logo fas fa-sliders-h text-primary fs-3"></i>
          <h1 className="display-5 ms-2">ldgr</h1>
        </a>
        <div className="d-flex justify-content-center align-items-center">
          <button className="btn btn-primary" type="button">Sign in</button>
        </div>
      </div>
    </header>
  );
};

export default DashboardHeader;

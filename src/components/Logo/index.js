import './index.scss';

const Logo = ()=>{
  return (
    <a className="navbar-brand d-flex align-items-center" href="/">
      <i className="dashboard-header-logo fas fa-sliders-h text-primary fs-3"></i>
      <h1 className="display-5 ms-2">ldgr</h1>
    </a>
  );
};

export default Logo;

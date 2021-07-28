import {Link} from 'react-router-dom';

import './index.scss';

const Logo = ()=>{
  return (
    <Link className="navbar-brand d-flex align-items-center" to="/">
      <i className="dashboard-header-logo fas fa-sliders-h text-primary fs-3"></i>
      <h1 className="display-5 ms-2">ldgr</h1>
    </Link>
  );
};

export default Logo;

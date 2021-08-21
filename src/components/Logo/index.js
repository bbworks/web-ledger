import {Link} from 'react-router-dom';

import './index.scss';

const Logo = ({ light })=>{
  return (
    <Link className={`navbar-brand d-flex align-items-center ${(light !== undefined ? "text-light" : "")}`} to="/">
      <i className={`dashboard-header-logo fas fa-sliders-h  ${(light !== undefined ? "" : "text-primary")} fs-3`}></i>
      <h1 className="display-5 ms-2 mb-0">ldgr</h1>
    </Link>
  );
};

export default Logo;

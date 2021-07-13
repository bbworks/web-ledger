import Logo from './../Logo';
import GoogleApiUserButton from './../GoogleApiUserButton';

import './index.scss';

const DashboardHeader = ({ signedInUser })=>{
  return (
    <header className="dashboard-header navbar-text">
      <div className="container d-flex justify-content-between">
        <Logo />
        <div className="d-flex justify-content-center align-items-center">
          <GoogleApiUserButton signedInUser={signedInUser}/>
        </div>
      </div>
    </header>
  );
};

export default DashboardHeader;

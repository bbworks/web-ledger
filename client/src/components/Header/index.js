import Logo from './../Logo';
import GoogleApiUserButton from './../GoogleApiUserButton';

import './index.scss';

const Header = ({ signedInUser, onLogOut })=>{
  return (
    <header className="dashboard-header navbar-text fixed-top bg-primary">
      <div className="container d-flex justify-content-between">
        <Logo light />
        <div className="d-flex justify-content-center align-items-center">
          <GoogleApiUserButton signedInUser={signedInUser} onLogOut={onLogOut} />
        </div>
      </div>
    </header>
  );
};

export default Header;

import Logo from './../Logo';
import GoogleApiSignInButton from './../GoogleApiSignInButton';

import './index.scss';

const SignInView = ()=>{
  return (
    <div className="view signin-view container-fluid">
      <div className="signin-view-container container-fluid d-flex flex-column justify-content-center align-items-center">
        <Logo />
        <GoogleApiSignInButton />
      </div>
    </div>
  );
};

export default SignInView;

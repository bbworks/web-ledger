import Logo from './../Logo';
import GoogleApiSignInButton from './../GoogleApiSignInButton';

import './index.scss';

const SignInView = ({ isReadyForSignIn })=>{
  return (
    <div className="view signin-view container-fluid">
      <div className="container-fluid d-flex flex-column justify-content-center align-items-center min-vh-100">
        <Logo />
        <GoogleApiSignInButton isReadyForSignIn={isReadyForSignIn} />
      </div>
    </div>
  );
};

export default SignInView;

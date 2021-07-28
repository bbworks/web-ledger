import {signIn} from './../../googleApi'

import './index.scss';

const GoogleApiSigninButton = ({ isReadyForSignIn })=>{
  return (
    <button className="btn btn-primary" type="button" onClick={signIn} disabled={!isReadyForSignIn}>Sign in with Google</button>
  );
};

export default GoogleApiSigninButton;

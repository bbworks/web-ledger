import {signIn} from './../../googleApi'

import './index.scss';

const GoogleApiSigninButton = ()=>{
  return (
    <button className="btn btn-primary" type="button" onClick={signIn}>Sign in with Google</button>
  );
};

export default GoogleApiSigninButton;

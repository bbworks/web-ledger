import {useState, useEffect} from 'react';

import Logo from './../Logo';
import GoogleApiSignInButton from './../GoogleApiSignInButton';

import './index.scss';

const SignInView = ()=>{
  return (
    <div className="view signin-view container-fluid py-2 mb-0">
      <Logo />
      <GoogleApiSignInButton />
    </div>
  );
};

export default SignInView;

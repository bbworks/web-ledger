import {useState, useEffect} from 'react';

import Logo from './../Logo';
import GoogleApiSignInButton from './../GoogleApiSignInButton';

import './index.scss';

const SignInView = ()=>{
  return (
    <div className="view signin-view container-fluid mb-0">
      <div className="container-fluid d-flex flex-column justify-content-center align-items-center min-vh-100">
        <Logo />
        <GoogleApiSignInButton />
      </div>
    </div>
  );
};

export default SignInView;

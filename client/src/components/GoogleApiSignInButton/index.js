import './index.scss';

const GoogleApiSigninButton = ()=>{
  return (
    <a className="btn btn-primary" href={`${process.env.REACT_APP_API_ENDPOINT || ""}/api/v1/authorize`}>
      Sign in with Google
    </a>
  );
};

export default GoogleApiSigninButton;

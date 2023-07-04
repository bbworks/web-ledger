import './index.scss';

const GoogleApiUserButton = ({ signedInUser, onLogOut })=>{
  return (
    <div className="dropdown">
      <button className="user-button btn bg-light" type="button" id="user-button" data-bs-toggle="dropdown" aria-expanded="false">
        <img className="user-button-image" src={signedInUser.picture} alt="signed in user image"/>
        <span className="user-button-name">{signedInUser.given_name}</span>
      </button>
      <ul className="dropdown-menu" aria-labelledby="user-button">
        <li><a className="dropdown-item" href="#" onClick={onLogOut}>Sign out</a></li>
      </ul>
    </div>

  );
};

export default GoogleApiUserButton;

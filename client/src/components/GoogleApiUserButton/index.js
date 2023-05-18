import './index.scss';

const GoogleApiUserButton = ({ signedInUser })=>{
  return (
    <div className="dropdown">
      <button className="user-button btn bg-light" type="button" id="user-button" data-bs-toggle="dropdown" aria-expanded="false">
        <img className="user-button-image" src={signedInUser.imageUrl} alt="signed in user image"/>
        <span className="user-button-name">{signedInUser.firstName}</span>
      </button>
      <ul className="dropdown-menu" aria-labelledby="user-button">
        <li><a className="dropdown-item" onClick={/* signOut */()=>{}}>Sign out</a></li>
      </ul>
    </div>

  );
};

export default GoogleApiUserButton;

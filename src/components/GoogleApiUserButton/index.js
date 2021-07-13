import {signOut} from './../../googleApi';

import './index.scss';

const GoogleApiUserButton = ({ signedInUser })=>{
  return (
    <div class="dropdown">
      <button className="user-button btn bg-light" type="button" id="user-button" data-bs-toggle="dropdown" aria-expanded="false">
        <img className="user-button-image" src={signedInUser.imageUrl} />
        <span className="user-button-name">{signedInUser.firstName}</span>
      </button>
      <ul class="dropdown-menu" aria-labelledby="user-button">
        <li><a class="dropdown-item" onClick={signOut}>Sign out</a></li>
      </ul>
    </div>

  );
};

export default GoogleApiUserButton;

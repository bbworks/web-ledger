import {useEffect} from 'react';
import {useLocation} from 'react-router-dom';

import SettingsInput from './../SettingsInput';

import './index.scss';

const SettingsView = ({ setFooterNavbar, settings, onSubmit:onSubmitProp })=>{
  //Send the route to the footer navbar
  const route = useLocation().pathname;
  useEffect(()=>{
    setFooterNavbar(route);
  }, []);

  const onSubmit = event=>{
    event.preventDefault();

    const submittedData = [...event.target.querySelectorAll(".setting-input [name]")].reduce((data, {name, value})=>({...data, [name]: value}), {});

    onSubmitProp(submittedData);
  };

  return (
    <div className="view settings-view container-fluid py-2">
      <form onSubmit={onSubmit}>
        <h1 className="page-title display-3">Settings</h1>
        {Object.entries(settings).map(([name, props])=>(<SettingsInput key={name} setting={{name, ...props}} />))}
        <div className="d-flex justify-content-center mt-4">
          <button className="btn btn-primary" type="submit">Save</button>
        </div>
      </form>
    </div>
  );
};

export default SettingsView;

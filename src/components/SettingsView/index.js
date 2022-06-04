import {useEffect} from 'react';
import {useLocation} from 'react-router-dom';

import SettingsForm from './../SettingsForm';

import './index.scss';

const SettingsView = ({ setFooterNavbar, settings, onSubmit })=>{
  //Send the route to the footer navbar
  const route = useLocation().pathname;
  useEffect(()=>{
    setFooterNavbar(route);
  }, [route]);

  return (
    <div className="view settings-view">
      <div className="container">
        <h1 className="page-title display-3">Settings</h1>
        <SettingsForm settings={settings} onSubmit={onSubmit} />
      </div>
    </div>
  );
};

export default SettingsView;

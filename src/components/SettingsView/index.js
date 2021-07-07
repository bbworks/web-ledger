import {useEffect} from 'react';
import {useLocation} from 'react-router-dom';

import './index.scss';

const SettingsView = ({ setFooterNavbar })=>{
  //Send the route to the footer navbar
  const route = useLocation().pathname;
  useEffect(()=>{
    setFooterNavbar(route);
  }, []);

  return (
    <div className="view settings-view container-fluid py-2"></div>
  );
};

export default SettingsView;

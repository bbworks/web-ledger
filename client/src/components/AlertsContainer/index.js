import './index.scss';

import {useAlerts} from './../../context/AlertsContext';

import Alert from './../Alert';

const AlertsContainer = ()=>{
  const alerts = useAlerts();

  return (
    <div id="alerts-container" class="alerts-container">
      {alerts.map((alrt, i)=>(
        <Alert key={i} text={alrt.text} type={alrt.type} duration={alrt.duration} />
      ))}
    </div>
  );
};

export default AlertsContainer;

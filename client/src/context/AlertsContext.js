import {useState, useContext, createContext} from 'react';

const AlertsContext = createContext();

const AddAlertContext = createContext();

export const useAlerts = ()=>{
  return useContext(AlertsContext);
};

export const useAddAlert = ()=>{
  return useContext(AddAlertContext);
};

export const AlertsProvider = ({children})=>{
  const [alerts, setAlerts] = useState([]);

  const addAlert = (newAlert)=>{
    setAlerts([...alerts, newAlert]);
  };

  return (
    <AlertsContext.Provider value={alerts}>
      <AddAlertContext.Provider value={addAlert}>
        {children}
      </AddAlertContext.Provider>
    </AlertsContext.Provider>
  );
};

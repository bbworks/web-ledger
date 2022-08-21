import {useState, useEffect} from 'react';

import './index.scss';

const SettingsInput = ({ setting })=>{
  const [name, setName] = useState(setting.name || "");
  const [value, setValue] = useState(setting.value || "");

  useEffect(()=>{
    if (!setting) return;

    setName(setting.name || "");
    setValue(setting.value || "");
  }, [setting]);

  const onChange = event=>{
    setValue(event.target.value);
  };

  return (
    <div className="setting-input mb-3">
      <label htmlFor={name} className="form-label">{name}</label>
      <input id={name} className="form-control" name={name} type="text" value={value} onChange={onChange} />
    </div>
  );
};

export default SettingsInput;

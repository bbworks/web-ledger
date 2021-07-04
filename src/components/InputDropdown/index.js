import {useState, useEffect} from 'react';

import './InputDropdown.js';
import './InputDropdown.css';
import './index.scss';

const InputDropdown = ({ name, value: initialValue, items, placeholder, onKeyDown, onChange: onChangeProp })=>{
  const [value, setValue] = useState(initialValue);

  //Update the dropdown value whenever a new one is passed
  useEffect(()=>setValue(initialValue), [initialValue]);

  const onChange = event=>{
    setValue(event.target.value); //handle dropdown onChange
    onChangeProp(event); //handle ancestor-passed onChange prop
  };


  return (
    <div className="input-dropdown">
      <input className="input-dropdown-input transaction-modal-input" name={name} value={value} placeholder={placeholder} onChange={onChange} onKeyDown={onKeyDown} autoComplete="off"/>
      <div className="input-dropdown-chevron-container">
          <i className="input-dropdown-chevron"></i>
        </div>
      <ul className="input-dropdown-list">
        {items.map(item=><li key={item} className="input-dropdown-list-item">{item}</li>)}
      </ul>
    </div>
  );
};

export default InputDropdown;

import {useState, useEffect} from 'react';

import './InputDropdown.js';
import './InputDropdown.css';
import './index.css';

const InputDropdown = ({ value: initialValue, items, onKeyDown, onChange: onChangeProp })=>{
  const [value, setValue] = useState(initialValue);

  //Update the dropdown value whenever a new one is passed
  useEffect(()=>setValue(initialValue), [initialValue]);

  const onChange = event=>{
    setValue(event.target.value); //handle dropdown onChange
    onChangeProp(event); //handle ancestor-passed onChange prop
  };


  return (
    <div className="dropdown">
      <input className="dropdown-input transaction-modal-input" placeholder="Choose one..." required value={value} onChange={onChange} onKeyDown={onKeyDown} />
      <div className="dropdown-chevron-container">
          <i className="dropdown-chevron"></i>
        </div>
      <ul className="dropdown-list">
        {items.map(item=><li key={item} className="dropdown-list-item">{item}</li>)}
      </ul>
    </div>
  );
};

export default InputDropdown;

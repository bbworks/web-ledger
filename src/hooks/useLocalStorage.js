import {useState} from 'react';

const useLocalStorage = (key, initialValue)=>{
  const [item, setItem] = useState(()=>{
    //If no initialValue was specified, use whats in localStorage
    if (!initialValue) return JSON.parse(localStorage.getItem(key)) || null;

    //Otherwise, overwrite what's in localStorage
    localStorage.setItem(key, JSON.stringify(initialValue));

    return initialValue;
  });

  const setItemHandler = newValue=>{
    //Update the local state
    if (typeof newValue === "function") {
      setItem(newValue(item));
    }
    else {
      setItem(newValue);
    }

    //Update localStorage
    localStorage.setItem(key, JSON.stringify(newValue));
  };

  return [item, setItemHandler];
};

export default useLocalStorage;

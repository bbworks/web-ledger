import {useState, useEffect} from 'react';

import {useError} from './../hooks';

const useApi = (api, initialValue)=>{
  const throwError = useError();

  //Initialize state
  const [data, setData] = useState(initialValue);
  const [error, setError] = useState(undefined);
  const [loading, setLoading] = useState(false);
  // const [refreshIndex, setRefreshIndex] = useState(0);

  //Declare variables
  let cancelled = false;

  // //Create functions
  // const refresh = ()=>{
  //   setRefreshIndex(previousRefreshIndex=>previousRefreshIndex+1);
  // };

  //create functions
  const fetchApi = async (...rest)=>{
    //Set the loading & cancelled status
    setLoading(true);
    setError(undefined);
    cancelled = false;

    //Attempt to call the api function,
    // and set the data if successful
    try {
      if(!cancelled) {
        const data = await api(...rest);
        setData(data);
      }
    }
    //Otherwise, set the error
    catch (err) {
      if(!cancelled) {
        setError(err);
        setData([]);
        throwError(err.message, err.err, err.throw ?? false);
      };
    }
    //Either way, reset the loading status
    finally {
      setLoading(false);
    }
  };

  //Declare side effects
  useEffect(()=>{
    //Short-circuit if there's no api function provided
    if (!api) return;

    //Return the cleanup function
    return ()=>{
      cancelled = true;
    }
  }, [api/*, refreshIndex*/]);

  //Return states and fetch function
  return {loading, error, data, fetchApi/*, refresh*/};
};

export default useApi;

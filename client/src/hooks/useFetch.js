import {useState, useEffect, useCallback} from 'react';
import path from 'path';

import {useError} from './../hooks';

const useFetch = (initialUrl, initialMethod="GET")=>{
  const throwError = useError();

  //Initialize state
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState(null);
  const [ok, setOk] = useState(null);
  
  //Declare variables
  
  
  // //Create functions
  const fetchData = useCallback(async (urlParam, methodParam, payload, queryParams)=>{
    setIsLoading(true);
    
    const url = urlParam || initialUrl;
    const method = methodParam || initialMethod;

    const headers = (!payload ? {} : {
      'Content-Type': "application/json"
    });
    const body = (!payload ? '' : JSON.stringify(payload));
    const query = queryParams && Object.entries(queryParams)
      .map(([key, value])=>
        [encodeURIComponent(key), encodeURIComponent(value)].join("=")
      )
      .join("&");
    const endpoint = `${url}${!query ? '' : !url.endsWith("?") && `?${query}`}`;

    return fetch(endpoint, {
      method,
      headers,
      body,
    })
    .then(response=>{
      setStatus(response.status);
      setOk(response.ok);

      return response.json()
        .then(data=>{
          if(!response.ok) throw data;
          return data;
        });
    })
    .then(data=>{
      setData(data);
      setError(null);
      return data;
    })
    .catch(data=>{
      const err = data.error;
      setData(null);
      setError(err);
      throwError(`Error fetching ${method} ${endpoint}`, err);
      // throw err;  //thrown on above line
    })
    .finally(()=>
      setIsLoading(false)
    );
  }, [initialUrl, initialMethod]);

  //Create side effects
  useEffect(()=>{
    if(!initialUrl) return;

    fetchData();
  }, [fetchData, initialUrl, initialMethod]);
  
  return {data, error, isLoading, fetchData, status, ok};
};

export default useFetch;

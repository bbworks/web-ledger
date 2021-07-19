import {useState, useEffect} from 'react';

const useScript = (src, optionsParam)=>{
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(()=>{
    new Promise((resolve, reject)=>{
      //Create default options
      const defaultOptions = {
        async: true,
      };

      //Create the script tag that will be attached to the DOM
      const script = document.createElement("script");

      //Combine the options, overwriting the defaults
      const options = {
        ...defaultOptions,
        ...optionsParam,
      };

      //Attach the options to the script tag
      Object.entries(options).forEach(([option, value])=>script[option] = value);

      //Attach the src to the script tag
      script.src = src;

      const onLoad = event=>{
        setIsLoaded(true)
        return resolve(event);
      };

      const onError = event=>{
        return reject(event);
      };

      //Create onload & onerror callbacks
      script.addEventListener("load", onLoad)
      script.addEventListener("error", onError);

      document.body.appendChild(script);

      return ()=>{
        document.body.removeChild(script);
        setIsLoaded(false);
      }
    });
  }, []);

  return isLoaded;
};

export default useScript;

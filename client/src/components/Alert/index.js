import {useState, useEffect, useRef} from 'react';

import './index.scss';

const Alert = ({text, type, duration:initialDuration})=>{
  const duration = initialDuration || 5000;

  //Validate the alert type
  if (["info", "success", "warning", "error"].includes(type)) type = "INFO";

  //Declare state
  const [isBeingHovered, setIsBeingHovered] = useState(false);
  const [isFadedOut, setIsFadedOut] = useState(true);
  const [isHidden, setIsHidden] = useState(false);

  //Declare variables
  const ALERT_ICON = {
    INFO: "fas fa-info-circle",
    SUCCESS: "fas fa-check-circle",
    WARNING: "fas fa-exclamation-triangle",
    ERROR: "fas fa-times-circle",
  };
  const fadingOutClassName = "fading-out";
  let fadeOutTimeoutId = useRef(null);
  let hiddenTimeoutId = useRef(null);


  //Create helper functions
  const stopAlertTimer = ()=>{
    window.clearTimeout(fadeOutTimeoutId.current);
  };

  const startAlertTimer = ()=>{
    fadeOutTimeoutId.current = window.setTimeout(fadeOut, duration);
  };

  const fadeIn = ()=>{
    //Fade in after after 10ms, and call our callback
    // if (element.classList.contains(fadingOutClassName)) window.setTimeout(()=>{
    //   element.classList.remove(fadingOutClassName);
    // }, 10);
    setIsFadedOut(false);
  };

  const fadeOut = ()=>{
    //Fade out
    // if (!element.classList.contains(fadingOutClassName)) element.classList.add(fadingOutClassName);
    setIsFadedOut(true);

    hiddenTimeoutId.current = setTimeout(()=>setIsHidden(true), 100);
  };


  //Declare side effects
  useEffect(()=>{
    //When the component mounts, fade it in
    fadeIn();

    //Begin a fade out timeout for the component
    startAlertTimer();

    //Return the cleanup function
    return ()=>{
      //Fade the alert back out
      fadeOut();

      //Clear the fade out timeout
      stopAlertTimer();
    }
  }, []);


  //Add event Listeners
  const onMouseEnter = function(event) {
    //Clear the fade out timeout while hovering over the alert
    stopAlertTimer();

    // //Set the hover state, so onMouseLeave() will know to
    // // start up the fade out timeout again once blur begins
    // setIsBeingHovered(true);
  };

  const onMouseLeave = function(event) {
    //If the component was not previously hovered over, ignore
    // if (!isBeingHovered) return;

    // //Reset the hover state
    // setIsBeingHovered(false);

    //Begin the timeout again to remove the alert
    startAlertTimer();
  };

  if(isHidden) return null;

  return (
    <div className={`alert alert-${type.toLowerCase()} ${isFadedOut ? fadingOutClassName : ''}`} onMouseEnter={onMouseEnter} onMouseLeave={onMouseLeave}>
      <div className="alert-content">
        <div className="alert-content-text">
          <i className={`alert-content-icon ${ALERT_ICON[type.toUpperCase()]}`}></i>
          {text}
        </div>
      </div>
    </div>
  );
};

export default Alert;

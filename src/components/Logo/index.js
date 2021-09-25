import {Link} from 'react-router-dom';
import {useState, useEffect, useRef} from 'react';

import './index.scss';

const Logo = ({ light, scrollIn, onLogoTextScrollIn })=>{
  //Declare variables
  const [isLogoTextScrolledIn, setIsLogoTextScrolledIn] = useState(scrollIn === true ? false : undefined)
  const [isLoadingAnimationComplete, setIsLoadingAnimationComplete] = useState(scrollIn === true && false)

  let isLoadingAnimationCompleteTimeout = useRef(null);
  let textScrollInTimeout = useRef(null);
  const logoText = useRef(null);

  //
  useEffect(()=>{
    if (!(isLoadingAnimationComplete === true)) return;
    if (onLogoTextScrollIn) onLogoTextScrollIn();
  }, [isLoadingAnimationComplete]);

  //When the component mounts, scroll the log in, if requested
  useEffect(()=>{
    if (!(scrollIn === true))return;
    isLoadingAnimationCompleteTimeout.current = window.setTimeout(()=>setIsLoadingAnimationComplete(true), 2000);
    textScrollInTimeout.current = window.setTimeout(()=>{
      if (!logoText.current) return;
      setIsLogoTextScrolledIn(true);
    }, 1000);

    return ()=>{
      window.clearTimeout(isLoadingAnimationCompleteTimeout.current);
      window.clearTimeout(textScrollInTimeout.current);
    };
  }, [scrollIn, logoText.current]);

  return (
    <Link className={`logo navbar-brand d-flex align-items-center me-0 ${(light !== undefined ? "text-light" : "")}`} to="/">
      <i className={`logo-icon dashboard-header-logo fas fa-sliders-h  ${(light !== undefined ? "" : "text-primary")} fs-3`}></i>
      <h1 className={`logo-text display-5 ms-2 mb-0 ${(isLogoTextScrolledIn===false ? "hidden" : (isLogoTextScrolledIn===true ? "scrolled-in" : ""))}`} ref={logoText}>ldgr</h1>
    </Link>
  );
};

export default Logo;

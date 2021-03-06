import {useEffect, useRef} from 'react';
import {Link} from 'react-router-dom';

import './index.scss';

const FooterNavbar = ({ active })=>{
  const footerNavbar = useRef(null);

  const setActiveItem = (active, footerNavbar)=>{
    if (!active) return;
    const activePath = (process.env.NODE_ENV === "production" ? process.env.PUBLIC_URL : '')+(active === "/" ? "/dashboard" : active);
    const navItems = [...footerNavbar.current.querySelectorAll(".footer-nav-item")];
    const activeItem = navItems.find(navItem=>navItem.getAttribute("href") === activePath);
    navItems.forEach(navItem=>navItem.classList.remove("active"));
    if (activeItem) activeItem.classList.add("active");
  };

  useEffect(()=>{
    setActiveItem(active, footerNavbar)
  }, [active]);

  return (
    <footer className="footer fixed-bottom" ref={footerNavbar}>
      <nav className="footer-nav nav nav-pills nav-justified">
        <Link className="footer-nav-item nav-link d-flex flex-column" to="/dashboard"><i className="footer-nav-item-icon fas fa-home pb-1"></i>Dashboard</Link>
        <Link className="footer-nav-item nav-link d-flex flex-column" to="/budgets"><i className="footer-nav-item-icon far fa-clipboard pb-1"></i>Budgets</Link>
        <Link className="footer-nav-item nav-link d-flex flex-column" to="/transactions"><i className="footer-nav-item-icon fas fa-list pb-1"></i>Transactions</Link>
        <Link className="footer-nav-item nav-link d-flex flex-column" to="/settings"><i className="footer-nav-item-icon fas fa-cogs pb-1"></i>Settings</Link>
      </nav>
    </footer>
  );
};

export default FooterNavbar;

import {useEffect, useRef} from 'react';

import './index.scss';

const FooterNavbar = ({ active })=>{
  const footerNavbar = useRef(null);

  const setActiveItem = (active, footerNavbar)=>{
    if (!active) return;
    const activeItem = footerNavbar.current.querySelector(`[href="${active}"]`);
    activeItem.classList.add("active");
  };

  useEffect(()=>{
    setActiveItem(active, footerNavbar)
  });

  return (
    <footer className="footer fixed-bottom" ref={footerNavbar}>
      <nav className="footer-nav nav nav-pills nav-justified">
        <a className="footer-nav-item nav-link d-flex flex-column" href="/dashboard"><i className="footer-nav-item-icon fas fa-home pb-1"></i>Dashboard</a>
        <a className="footer-nav-item nav-link d-flex flex-column" href="/budgets"><i className="footer-nav-item-icon far fa-clipboard pb-1"></i>Budgets</a>
        <a className="footer-nav-item nav-link d-flex flex-column" href="/transactions"><i className="footer-nav-item-icon fas fa-list pb-1"></i>Transactions</a>
        <a className="footer-nav-item nav-link d-flex flex-column" href="/settings"><i className="footer-nav-item-icon fas fa-cogs pb-1"></i>Settings</a>
      </nav>
    </footer>
  );
};

export default FooterNavbar;

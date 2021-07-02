import './index.scss';

const FooterNavbar = ()=>{
  return (
    <footer className="footer fixed-bottom">
      <nav className="footer-nav nav nav-pills nav-justified">
        <a className="footer-nav-item nav-link d-flex flex-column active" href="/dashboard"><i className="footer-nav-item-icon fas fa-home pb-1"></i>Dashboard</a>
        <a className="footer-nav-item nav-link d-flex flex-column" href="/budgets"><i className="footer-nav-item-icon far fa-clipboard pb-1"></i>Budget</a>
        <a className="footer-nav-item nav-link d-flex flex-column" href="/transactions"><i className="footer-nav-item-icon fas fa-list pb-1"></i>Transactions</a>
        <a className="footer-nav-item nav-link d-flex flex-column" href="/settings"><i className="footer-nav-item-icon fas fa-cogs pb-1"></i>Settings</a>
      </nav>
    </footer>
  );
};

export default FooterNavbar;

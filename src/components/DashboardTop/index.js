import {useState, useEffect} from 'react';

import {convertNumberToCurrency} from './../../utilities.js';

import './index.scss';

const DashboardTop = ()=>{
  const initialAccountsData = JSON.parse(localStorage.getItem("accounts-data"));
  const initialAccountData = JSON.parse(localStorage.getItem("account-data"));

  const [accountsData, setAccountsData] = useState(initialAccountsData || null);
  const [creditScore, setCreditScore] = useState(initialAccountData && initialAccountData.creditScore || null);

  useEffect(()=>console.log("Accounts data:", accountsData), [accountsData]);

  return (
    <div className="dashboard-top">
      <div className="dashboard-account-overview container-fluid py-2 px-3">
        <div className="container-fluid text-end text-muted my-2">
          Last Updated:&nbsp;
          <span className="dashboard-accounts-total d-inline">6/29/2021</span>
        </div>
        <div className="row">
          <div className="dashboard-accounts-total-container col text-center fw-bold h4 d-flex flex-column border-end border-2">
            Total in Accounts:
            <span className="dashboard-accounts-total">{convertNumberToCurrency(accountsData && accountsData[0].balance ? accountsData.reduce((total,accountData)=>total+=Number(accountData.balance), 0) : 0)}</span>
          </div>
          <div className="dashboard-credit-score-container col text-center fw-bold h4 d-flex flex-column">
            Credit Score:
            <span className="dashboard-credit-score">{creditScore}</span>
          </div>
        </div>
      </div>
      <div className="dashboard-month-dropdown dropdown">
        <button id="dashboardMonthDropdown" className="btn dropdown-toggle container-fluid" type="button" data-bs-toggle="dropdown" aria-expanded="false">
          <strong className="dashboard-month-dropdown-month h2 d-block mb-0">June 2021</strong>
          <em className="dashboard-month-dropdown-month-description d-block text-muted h6">(current)</em>
        </button>
        <ul className="dropdown-menu container-fluid ">
          <li><a href="#" className="dropdown-item">June 2021</a></li>
          <li><a href="#" className="dropdown-item">May 2021</a></li>
          <li><a href="#" className="dropdown-item">April 2021</a></li>
          <li><a href="#" className="dropdown-item">March 2021</a></li>
          <li><a href="#" className="dropdown-item">February 2021</a></li>
          <li><a href="#" className="dropdown-item">January 2021</a></li>
        </ul>
      </div>
    </div>
  );
};

export default DashboardTop;

import {useState, useEffect} from 'react';

import {convertNumberToCurrency} from './../../utilities';

import DashboardBudgetCycleDropdown from './../DashboardBudgetCycleDropdown';

import './index.scss';

const DashboardTop = ({ transactions, accountsData, accountData, budgetCycle, onBudgetCycleChange })=>{
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
            <span className="dashboard-accounts-total">{convertNumberToCurrency(accountsData.length && accountsData[0].Balance ? accountsData.reduce((total,accountData)=>total+=Number(accountData.Balance), 0) : NaN) || "--"}</span>
          </div>
          <div className="dashboard-credit-score-container col text-center fw-bold h4 d-flex flex-column">
            Credit Score:
            <span className="dashboard-credit-score">{(accountData.length ? accountData.sort((a,b)=>a.LastUpdated+b.LastUpdated)/*sort descending*/.filter(record=>record.CreditScore)[0].CreditScore /*most recent LastUpdated*/ : "--")}</span>
          </div>
        </div>
      </div>
      <DashboardBudgetCycleDropdown transactions={transactions} budgetCycle={budgetCycle} onChange={onBudgetCycleChange} />
    </div>
  );
};

export default DashboardTop;

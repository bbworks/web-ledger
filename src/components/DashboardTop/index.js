import {convertNumberToCurrency} from './../../utilities';
import {useBudgetCycleTransactions} from './../../hooks';

import DashboardBudgetCycleDropdown from './../DashboardBudgetCycleDropdown';

import './index.scss';

const DashboardTop = ({ transactions, accountsData, accountData, budgetCycle, allBudgetCycles, onBudgetCycleChange })=>{
  const budgetCycleTransactions = useBudgetCycleTransactions(transactions, budgetCycle);

  const currentBudgetCycleIncome = budgetCycleTransactions.income.length && budgetCycleTransactions.income.reduce((total, t)=>total+=t.Amount, 0);
  const currentBudgetCycleExpenses = budgetCycleTransactions.expenses.length && budgetCycleTransactions.expenses.reduce((total, t)=>total+=t.Amount, 0);
  const currentBudgetCycleRemaining = currentBudgetCycleIncome+currentBudgetCycleExpenses;

  const getLastUpdatedDate = transactions=>{
    if (!transactions.length) return null;

    return new Date(Math.max(...transactions.map(t=>[t.DateCreated.getTime(), t.DateModified.getTime()]).flat()));
  };

  return (
    <div className="dashboard-top">
      <div className="dashboard-account-overview container-fluid py-2 px-3">
        <div className="container-fluid text-end text-muted my-2">
          Last Updated:&nbsp;
          <span className="dashboard-accounts-total d-inline">{getLastUpdatedDate(transactions) ? getLastUpdatedDate(transactions).toLocaleDateString(/*"en-US", {timeZone: "UTC"}*/) : "--"}</span>
        </div>
        <div className="row">
          <div className="dashboard-accounts-total-container col text-center fw-bold h4 d-flex flex-column border-end border-2">
            Month Remaining:
            <span className="dashboard-accounts-total">{currentBudgetCycleRemaining ? convertNumberToCurrency(currentBudgetCycleRemaining) : "--"}</span>
          </div>
          <div className="dashboard-credit-score-container col text-center fw-bold h4 d-flex flex-column">
            Credit Score:
            <span className="dashboard-credit-score">{(accountData.length ? accountData.sort((a,b)=>a.LastUpdated+b.LastUpdated)/*sort descending*/.filter(record=>record.CreditScore)[0].CreditScore /*most recent LastUpdated*/ : "--")}</span>
          </div>
        </div>
      </div>
      <DashboardBudgetCycleDropdown transactions={transactions} budgetCycle={budgetCycle} allBudgetCycles={allBudgetCycles} onChange={onBudgetCycleChange} />
    </div>
  );
};

export default DashboardTop;

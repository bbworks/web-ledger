import {useState, useEffect} from 'react';

import {getBudgetCycleString, getBudgetCyclesFromTransactions, getBudgetCycleDescription, getBudgetCycleFromDate} from './../../utilities';

import './index.scss';

const DashboardBudgetCycleDropdown = ({ transactions, budgetCycle, onChange:onChangeProp })=>{
  const todayBudgetCycle = getBudgetCycleFromDate(new Date());

  const getAllBudgetCycles = ()=>{
    return [
      ...new Set([
        todayBudgetCycle, //assure the current month is an option as well
        ...getBudgetCyclesFromTransactions(transactions),
      ].map(date=>date.toJSON()))
    ]
      .map(JSON=>new Date(JSON));
  };

  const [allBudgetCycles, setAllBudgetCycles] = useState(getAllBudgetCycles());

  useEffect(()=>
    setAllBudgetCycles(getAllBudgetCycles())
  , [transactions]);

  const onClick = event=>{
    const budgetCycleJSON = event.target.getAttribute("data-budget-cycle");
    if (!budgetCycleJSON) return;
    const budgetCycle = new Date(budgetCycleJSON);
    onChangeProp(budgetCycle);
  };

  return (
    <div className="dashboard-month-dropdown dropdown">
      <button id="dashboardMonthDropdown" className="btn dropdown-toggle container-fluid" type="button" data-bs-toggle="dropdown" aria-expanded="false">
        <strong className="dashboard-month-dropdown-month h2 d-block mb-0">
          {getBudgetCycleString(budgetCycle)}
        </strong>
        <em className="dashboard-month-dropdown-month-description d-block text-muted h6">({getBudgetCycleDescription(budgetCycle)})</em>
      </button>
      <ul className="dropdown-menu container-fluid" onClick={onClick}>
        {allBudgetCycles.map(budgetCycle=>(
          <li key={budgetCycle.toJSON()}>
            <a href="#" className="dropdown-item" data-budget-cycle={budgetCycle.toJSON()}>
              {getBudgetCycleString(budgetCycle)} <em className="text-muted">({getBudgetCycleDescription(budgetCycle)})</em>
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default DashboardBudgetCycleDropdown;

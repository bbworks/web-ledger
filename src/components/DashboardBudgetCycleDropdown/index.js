import {getBudgetCycleFromDate, getBudgetCycleString, getBudgetCycleDescription, isAllTransactionsBudgetCycle} from './../../utilities';

import './index.scss';

const DashboardBudgetCycleDropdown = ({ transactions, budgetCycle, allBudgetCycles, onChange:onChangeProp, squashed })=>{
  const onClick = event=>{
    const epochTimeAttribute = event.target.getAttribute("data-budget-cycle");
    if (!epochTimeAttribute || isNaN(epochTimeAttribute)) return;
    const epochTime = Number(epochTimeAttribute);
    const budgetCycle = getBudgetCycleFromDate(new Date(epochTime));
    onChangeProp(budgetCycle);
  };

  const arrowOnClick = increment=>{
    const allBudgetCyclesSorted = [...allBudgetCycles].sort((a,b)=>(a.getTime() === b.getTime() ? 0 : (a.getTime() < b.getTime() ? -1 : 1))); //sort() is in-place--create a new array using [...]
    console.log("test1: ", allBudgetCyclesSorted)
    console.log("test2: ", budgetCycle, allBudgetCyclesSorted.indexOf(budgetCycle), increment)
    const newBudgetCycle = allBudgetCyclesSorted[(allBudgetCyclesSorted.indexOf(allBudgetCyclesSorted.find(b=>b.getTime() === budgetCycle.getTime()))+increment+allBudgetCyclesSorted.length)%allBudgetCyclesSorted.length];
    console.log("test3: ", newBudgetCycle)
    onChangeProp(newBudgetCycle);
  };

  const incrementBudgetCycle = ()=>{
    return arrowOnClick(1);
  };

  const decrementBudgetCycle = ()=>{
    return arrowOnClick(-1);
  };

  return (
    <div className={`dashboard-month-dropdown ${squashed ? "squashed" : ""}`}>
      <button className="dashboard-month-dropdown-arrow dashboard-month-dropdown-arrow-left" type="button" onClick={decrementBudgetCycle}>
        <i className="fas fa-chevron-left"></i>
      </button>
      <div className="dashboard-month-dropdown-container dropdown">
        <button id="dashboardMonthDropdown" className="dashboard-month-dropdown-toggle btn dropdown-toggle container-fluid" type="button" data-bs-toggle="dropdown" aria-expanded="false">
          <strong className="dashboard-month-dropdown-month h2 mb-0">
            {getBudgetCycleString(budgetCycle)}
          </strong>
          <em className="dashboard-month-dropdown-month-description text-muted">
            {getBudgetCycleDescription(budgetCycle) ? ` (${getBudgetCycleDescription(budgetCycle)})` : ""}
          </em>
        </button>
        <ul className="dropdown-menu container-fluid" onClick={onClick}>
          {allBudgetCycles.map(budgetCycle=>(
            <>
              <li key={budgetCycle.getTime()}>
                <a className="dropdown-item" data-budget-cycle={budgetCycle.getTime()}>
                  {getBudgetCycleString(budgetCycle)}
                  <em className="text-muted">
                  {getBudgetCycleDescription(budgetCycle) ? ` (${getBudgetCycleDescription(budgetCycle)})` : ""}
                  </em>
                </a>
              </li>
              {
                isAllTransactionsBudgetCycle(budgetCycle) &&
                (
                  <li>
                    <hr class="dropdown-divider" />
                  </li>
                )
              }
            </>
          ))}
        </ul>
      </div>
      <button className="dashboard-month-dropdown-arrow dashboard-month-dropdown-arrow-right" type="button" onClick={incrementBudgetCycle}>
        <i className="fas fa-chevron-right"></i>
      </button>
    </div>
  );
};

export default DashboardBudgetCycleDropdown;

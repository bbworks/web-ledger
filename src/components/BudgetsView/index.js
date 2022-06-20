import {useState, useEffect} from 'react';
import {useLocation} from 'react-router-dom';

import BudgetGraph from './../BudgetGraph';
import DashboardBudgetCycleDropdown from './../DashboardBudgetCycleDropdown';
import TransactionsImportFormToggle from './../TransactionsImportFormToggle';
import NewBudgetModal from './../NewBudgetModal';

import {getBudgetAmountSpentFromTransactions} from './../../utilities';

import {useBudgetCycleTransactions, useBudgetCycleBudgets} from './../../hooks';

import './index.scss';

const BudgetsView = ({ transactions, budgetsData, budgetCycle, allBudgetCycles, onBudgetCycleChange, budgetTypes, budgetGroups, onNewBudgetModalSubmit:onNewBudgetModalSubmitProp, setFooterNavbar })=>{
  //Send the route to the footer navbar
  const route = useLocation().pathname;
  useEffect(()=>{
    setFooterNavbar(route);
  }, [route]);

  const [isNewBudgetModalOpen, setIsNewBudgetModalOpen] = useState(false);

  const budgetCycleTransactions = useBudgetCycleTransactions(transactions, budgetCycle);
  const budgetCycleBudgets = useBudgetCycleBudgets(budgetsData, budgetCycle);

  const onNewBudgetClick = event=>{
    openNewBudgetModal();
  };

  const onCloneBudgetCycleBudgetLinkClick = event=>{
    event.preventDefault();
    console.log("onCloneBudgetCycleBudgetLinkClick");
  };

  const openNewBudgetModal = ()=>{
    setIsNewBudgetModalOpen(true);
  };

  const closeNewBudgetModal = ()=>{
    setIsNewBudgetModalOpen(false);
  };

  const onNewBudgetModalSubmit = newBudget=>{
    console.log(newBudget);
    onNewBudgetModalSubmitProp(newBudget);
    closeNewBudgetModal();
  };

  const onTransactionImportFormToggleClick = event=>{
    setIsNewBudgetModalOpen(true);
  };

  return (
    <div className="view budgets-view">
      <DashboardBudgetCycleDropdown transactions={transactions} budgetCycle={budgetCycle} allBudgetCycles={allBudgetCycles} onChange={onBudgetCycleChange} squashed />
      {
        !budgetCycleBudgets.length ? (
          <div className="container new-budget-container">
            <p className="new-budget-paragraph">There are no budgets to display for this month. You should create one!</p>
            <button className="btn btn-primary new-budget-button" type="button" onClick={onNewBudgetClick}><i className="fas fa-plus"></i>&nbsp;New Budget</button>
            <p>Or <a className="hyperlink" href="#" onClick={onCloneBudgetCycleBudgetLinkClick}>copy last month</a>.</p>
          </div>
        ) : (
        <div className="container">
          <h1 className="page-title display-3">Month Overview</h1>
          <div className="budget-graphs">

            {
              (
                !budgetCycleBudgets ?
                '' :
                budgetCycleBudgets.map(budgetData=>
                  <BudgetGraph key={budgetData.Name} budget={{...budgetData, color: "#2196f3", amountSpent: getBudgetAmountSpentFromTransactions(budgetData.Name, budgetCycleTransactions.all)}}/>
                )
              )
            }
          </div>
        </div>
      )}
        {
          !budgetCycleBudgets.length ?
          null :
          <TransactionsImportFormToggle onClick={onTransactionImportFormToggleClick} />
        }
      <NewBudgetModal budgetCycle={budgetCycle} allBudgetCycles={allBudgetCycles} types={budgetTypes} groups={budgetGroups} isOpen={isNewBudgetModalOpen} onClose={closeNewBudgetModal} onSubmit={onNewBudgetModalSubmit} />
    </div>
  );
};

export default BudgetsView;

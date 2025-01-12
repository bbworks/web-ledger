import {useState, useEffect} from 'react';
import {useLocation} from 'react-router-dom';

import DashboardBudgetCycleDropdown from './../DashboardBudgetCycleDropdown';
import TransactionsImportForm from './../TransactionsImportForm';
import TransactionsData from './../TransactionsData';
import TransactionDetailModal from './../TransactionDetailModal';
import TransactionDeleteModal from './../TransactionDeleteModal';
import TransactionsImportDuplicatesModal from './../TransactionsImportDuplicatesModal';
import TransactionsImportConfirmedModal from './../TransactionsImportConfirmedModal';
import TransactionsImportFormToggle from './../TransactionsImportFormToggle';
import NewTransactionModal from './../NewTransactionModal';

import './index.scss';

const TransactionsView = ({ transactions, budgetCycle, allBudgetCycles, budgetsData, transactionsImportDuplicatesModalNewTransactions, transactionsImportDuplicatesModalDuplicates, budgetCycleBudgets, budgetCycleTransactions, isTransactionsImportDuplicatesModalOpen, onTransactionsImportDuplicatesModalClose, onTransactionsImportDuplicatesModalSubmit, onTransactionsImportFormSubmit:onTransactionsImportFormSubmitProp, onTransactionsImportFormFileInputChange:onTransactionsImportFormFileInputChangeProp, onTransactionDetailModalSubmit:onTransactionDetailModalSubmitProp, onTransactionDeleteModalSubmit:onTransactionDeleteModalSubmitProp, transactionsImportConfirmedModalTransactions, isTransactionsImportConfirmedModalOpen, closeTransactionsImportConfirmedModal, onTransactionsImportConfirmedModalSubmit, onBudgetCycleChange, transactionCategories, transactionTypes, onNewTransactionModalSubmit:onNewTransactionModalSubmitProp, setFooterNavbar })=>{
  //Send the route to the footer navbar
  const route = useLocation().pathname;
  useEffect(()=>{
    setFooterNavbar(route);
  }, [route]);

  const [isTransactionImportFormOpen, setIsTransactionImportFormOpen] = useState(false);

  const [transactionDetailModalTransaction, setTransactionDetailModalTransaction] = useState(null);
  const [isTransactionDetailModalOpen, setIsTransactionDetailModalOpen] = useState(false);
  const [transactionDeleteModalTransaction, setTransactionDeleteModalTransaction] = useState(null);
  const [isTransactionDeleteModalOpen, setIsTransactionDeleteModalOpen] = useState(false);
  const [isNewTransactionModalOpen, setIsNewTransactionModalOpen] = useState(false);

  const onTransactionImportFormToggleClick = event=>{
    setIsTransactionImportFormOpen(wasOpen=>!wasOpen);
  };

  const onTransactionsImportFormSubmit = scrapedTransactionsData=>{
    //Re-close the form
    setIsTransactionImportFormOpen(false);

    onTransactionsImportFormSubmitProp(scrapedTransactionsData);
  };

  const onTransactionsImportFormFileInputChange = transactionsDataArray=>{
    //Re-close the form
    setIsTransactionImportFormOpen(false);

    onTransactionsImportFormFileInputChangeProp(transactionsDataArray);
  };

  const openTransactionDetailModal = ()=>{
    setIsTransactionDetailModalOpen(true);
  };

  const closeTransactionDetailModal = ()=>{
    setIsTransactionDetailModalOpen(false);
  };

  const openTransactionDeleteModal = ()=>{
    setIsTransactionDeleteModalOpen(true);
  };

  const closeTransactionDeleteModal = ()=>{
    setIsTransactionDeleteModalOpen(false);
  };

  const onTransactionEditButtonClick = transaction=>{
    setTransactionDetailModalTransaction(transaction);
    openTransactionDetailModal();
  };

  const onTransactionDeleteButtonClick = transaction=>{
    setTransactionDeleteModalTransaction(transaction);
    openTransactionDeleteModal();
  };

  const onTransactionDetailModalSubmit = (updatedTransaction)=>{
    onTransactionDetailModalSubmitProp(transactionDetailModalTransaction, updatedTransaction);
    closeTransactionDetailModal();
  };

  const onTransactionDeleteModalSubmit = (deletedTransaction)=>{
    onTransactionDeleteModalSubmitProp(transactionDeleteModalTransaction, deletedTransaction);
    closeTransactionDeleteModal();
  };

  const openNewTransactionModal = ()=>{
    setIsNewTransactionModalOpen(true);
  };

  const closeNewTransactionModal = ()=>{
    setIsNewTransactionModalOpen(false);
  };

  const onNewTransactionClick = ()=>{
    openNewTransactionModal();
  };

  const onNewTransactionModalSubmit = newTransaction=>{
    onNewTransactionModalSubmitProp(newTransaction);
    closeNewTransactionModal();
  };

  const onImportTransactionsLinkClick = event=>{
    event.preventDefault();
    setIsTransactionImportFormOpen(true);
  };


  return (
    <div className="view transactions-view">
      <DashboardBudgetCycleDropdown transactions={transactions} budgetCycle={budgetCycle} allBudgetCycles={allBudgetCycles} onChange={onBudgetCycleChange} squashed/>
      {(
        !budgetCycleTransactions.all.length ? (
          <>
            <TransactionsImportForm isOpen={isTransactionImportFormOpen} onSubmit={onTransactionsImportFormSubmit} onFileInputChange={onTransactionsImportFormFileInputChange} />
            <div className="container new-transaction-container">
            <p className="new-transaction-paragraph mb-0">There are no transactions to display for this month.</p>
              <p className="new-transaction-paragraph">You should create one!</p>
              <button className="btn btn-primary new-transaction-button" type="button" onClick={onNewTransactionClick}><i className="fas fa-plus"></i>&nbsp;New Transaction</button>
              <p>Or <a className="hyperlink" href="#" onClick={onImportTransactionsLinkClick}>import them</a>.</p>
            </div>
            <TransactionsImportDuplicatesModal newTransactions={transactionsImportDuplicatesModalNewTransactions} duplicates={transactionsImportDuplicatesModalDuplicates} isOpen={isTransactionsImportDuplicatesModalOpen} onClose={onTransactionsImportDuplicatesModalClose} onSubmit={onTransactionsImportDuplicatesModalSubmit} />
            <TransactionsImportConfirmedModal transactions={transactionsImportConfirmedModalTransactions} isOpen={isTransactionsImportConfirmedModalOpen} onClose={closeTransactionsImportConfirmedModal} onSubmit={onTransactionsImportConfirmedModalSubmit} />
          </>
        ) :
        <div className="container-fluid p-0">
          <h1 className="page-title display-3">Transactions</h1>
          <TransactionsImportForm isOpen={isTransactionImportFormOpen} onSubmit={onTransactionsImportFormSubmit} onFileInputChange={onTransactionsImportFormFileInputChange} />
          <TransactionsData budgetCycleTransactions={budgetCycleTransactions} onTransactionEditButtonClick={onTransactionEditButtonClick} onTransactionDeleteButtonClick={onTransactionDeleteButtonClick} />
          <TransactionsImportFormToggle onClick={onTransactionImportFormToggleClick} />
          <TransactionDetailModal transaction={transactionDetailModalTransaction} allBudgetCycles={allBudgetCycles} categories={transactionCategories} types={transactionTypes} isOpen={isTransactionDetailModalOpen} onClose={closeTransactionDetailModal} onSubmit={onTransactionDetailModalSubmit} />
          <TransactionDeleteModal transaction={transactionDeleteModalTransaction} isOpen={isTransactionDeleteModalOpen} onClose={closeTransactionDeleteModal} onSubmit={onTransactionDeleteModalSubmit} />
          <TransactionsImportDuplicatesModal newTransactions={transactionsImportDuplicatesModalNewTransactions} duplicates={transactionsImportDuplicatesModalDuplicates} isOpen={isTransactionsImportDuplicatesModalOpen} onClose={onTransactionsImportDuplicatesModalClose} onSubmit={onTransactionsImportDuplicatesModalSubmit} />
          <TransactionsImportConfirmedModal transactions={transactionsImportConfirmedModalTransactions} isOpen={isTransactionsImportConfirmedModalOpen} onClose={closeTransactionsImportConfirmedModal} onSubmit={onTransactionsImportConfirmedModalSubmit} />
        </div>
      )}
      <NewTransactionModal budgetCycle={budgetCycle} allBudgetCycles={allBudgetCycles} categories={transactionCategories} types={transactionTypes} isOpen={isNewTransactionModalOpen} onClose={closeNewTransactionModal} onSubmit={onNewTransactionModalSubmit} />
    </div>
  );
};

export default TransactionsView;

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

import {useBudgetCycleTransactions} from './../../hooks';

import './index.scss';

const TransactionsView = ({ transactions, budgetCycle, allBudgetCycles, transactionsImportDuplicatesModalNewTransactions, transactionsImportDuplicatesModalDuplicates, isTransactionsImportDuplicatesModalOpen, onTransactionsImportDuplicatesModalClose, onTransactionsImportDuplicatesModalSubmit, onTransactionsImportFormSubmit:onTransactionsImportFormSubmitProp, onTransactionsImportFormFileInputChange:onTransactionsImportFormFileInputChangeProp, onTransactionDetailModalSubmit:onTransactionDetailModalSubmitProp, onTransactionDeleteModalSubmit:onTransactionDeleteModalSubmitProp, transactionsImportConfirmedModalTransactions, isTransactionsImportConfirmedModalOpen, closeTransactionsImportConfirmedModal, onTransactionsImportConfirmedModalSubmit, onBudgetCycleChange, transactionCategories, transactionTypes, setFooterNavbar })=>{
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

  const budgetCycleTransactions = useBudgetCycleTransactions(transactions, budgetCycle);

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

  return (
    <div className="view transactions-view">
      <DashboardBudgetCycleDropdown transactions={transactions} budgetCycle={budgetCycle} allBudgetCycles={allBudgetCycles} onChange={onBudgetCycleChange} squashed/>
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
    </div>
  );
};

export default TransactionsView;

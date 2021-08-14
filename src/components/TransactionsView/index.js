import {useState, useEffect} from 'react';
import {useLocation} from 'react-router-dom';

import TransactionsImportForm from './../TransactionsImportForm';
import TransactionsData from './../TransactionsData';
import TransactionDetailModal from './../TransactionDetailModal';
import TransactionDeleteModal from './../TransactionDeleteModal';
import TransactionsImportDuplicatesModal from './../TransactionsImportDuplicatesModal';
import TransactionsImportConfirmedModal from './../TransactionsImportConfirmedModal';

import {useConsoleLog, useBudgetCycleTransactions} from './../../hooks';

import './index.scss';

const TransactionsView = ({ transactions, budgetCycle, transactionsImportDuplicatesModalNewTransactions, transactionsImportDuplicatesModalDuplicates, isTransactionsImportDuplicatesModalOpen, onTransactionsImportDuplicatesModalClose, onTransactionsImportDuplicatesModalSubmit, onTransactionsImportFormSubmit, onTransactionsImportFormFileInputChange, onTransactionDetailModalSubmit:onTransactionDetailModalSubmitProp, onTransactionDeleteModalSubmit:onTransactionDeleteModalSubmitProp, transactionsImportConfirmedModalTransactions, isTransactionsImportConfirmedModalOpen, closeTransactionsImportConfirmedModal, onTransactionsImportConfirmedModalSubmit, setFooterNavbar })=>{
  //Send the route to the footer navbar
  const route = useLocation().pathname;
  useEffect(()=>{
    setFooterNavbar(route);
  }, []);

  const [transactionDetailModalTransaction, setTransactionDetailModalTransaction] = useState(null);
  const [isTransactionDetailModalOpen, setIsTransactionDetailModalOpen] = useState(false);
  const [transactionDeleteModalTransaction, setTransactionDeleteModalTransaction] = useState(null);
  const [isTransactionDeleteModalOpen, setIsTransactionDeleteModalOpen] = useState(false);
  const currentBudgetCycleTransactions = useBudgetCycleTransactions(transactions, budgetCycle);

  useConsoleLog(currentBudgetCycleTransactions, "currentBudgetCycleTransactions:");

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
      <h1 className="page-title display-3">Transactions</h1>
      <TransactionsImportForm onSubmit={onTransactionsImportFormSubmit} onFileInputChange={onTransactionsImportFormFileInputChange} />
      <TransactionsData transactions={currentBudgetCycleTransactions} onTransactionEditButtonClick={onTransactionEditButtonClick} onTransactionDeleteButtonClick={onTransactionDeleteButtonClick} />
      <TransactionDetailModal transaction={transactionDetailModalTransaction} buttonsOptions={{cancelButton: "Cancel", okButton: "Save"}} isOpen={isTransactionDetailModalOpen} onClose={closeTransactionDetailModal} onSubmit={onTransactionDetailModalSubmit} />
      <TransactionDeleteModal transaction={transactionDeleteModalTransaction} isOpen={isTransactionDeleteModalOpen} onClose={closeTransactionDeleteModal} onSubmit={onTransactionDeleteModalSubmit} />
      <TransactionsImportDuplicatesModal newTransactions={transactionsImportDuplicatesModalNewTransactions} duplicates={transactionsImportDuplicatesModalDuplicates} isOpen={isTransactionsImportDuplicatesModalOpen} onClose={onTransactionsImportDuplicatesModalClose} onSubmit={onTransactionsImportDuplicatesModalSubmit} />
      <TransactionsImportConfirmedModal transactions={transactionsImportConfirmedModalTransactions} isOpen={isTransactionsImportConfirmedModalOpen} onClose={closeTransactionsImportConfirmedModal} onSubmit={onTransactionsImportConfirmedModalSubmit} />
    </div>
  );
};

export default TransactionsView;

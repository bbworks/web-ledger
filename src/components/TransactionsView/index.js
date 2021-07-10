import {useState, useEffect} from 'react';
import {useLocation} from 'react-router-dom';

import TransactionsImportForm from './../TransactionsImportForm';
import TransactionsData from './../TransactionsData';
import TransactionDetailModal from './../TransactionDetailModal';
import TransactionsImportDuplicatesModal from './../TransactionsImportDuplicatesModal';

import './index.scss';

const TransactionsView = ({ transactions, transactionsImportDuplicatesModalNewTransactions, transactionsImportDuplicatesModalDuplicates, isTransactionsImportDuplicatesModalOpen, onTransactionsImportDuplicatesModalClose, onTransactionsImportDuplicatesModalSubmit, onTransactionsImportFormSubmit, onTransactionsImportFormFileInputChange, onTransactionDetailModalSubmit:onTransactionDetailModalSubmitProp, setFooterNavbar })=>{
  //Send the route to the footer navbar
  const route = useLocation().pathname;
  useEffect(()=>{
    setFooterNavbar(route);
  }, []);

  const [transactionDetailModalTransaction, setTransactionDetailModalTransaction] = useState(null);
  const [isTransactionDetailModalOpen, setIsTransactionDetailModalOpen] = useState(false);

  const openTransactionDetailModal = ()=>{
    setIsTransactionDetailModalOpen(true);
  };

  const closeTransactionDetailModal = ()=>{
    setIsTransactionDetailModalOpen(false);
  };

  const onTransactionEditButtonClick = transaction=>{
    setTransactionDetailModalTransaction(transaction);
    openTransactionDetailModal();
  };

  const onTransactionDetailModalSubmit = (updatedTransaction)=>{
    onTransactionDetailModalSubmitProp(transactionDetailModalTransaction, updatedTransaction);
    closeTransactionDetailModal();
  };

  return (
    <div className="view transactions-view">
      <div className="container">
        <h1 className="display-1">Ledger</h1>
        {/* <button className="btn btn-dark" type="button" data-toggle="collapse" data-target="#transaction-import-form">Import Transactions</button> */}
        <TransactionsImportForm onSubmit={onTransactionsImportFormSubmit} onFileInputChange={onTransactionsImportFormFileInputChange} />
        <TransactionsData transactions={transactions} onTransactionEditButtonClick={onTransactionEditButtonClick} />
      </div>
      <TransactionDetailModal transaction={transactionDetailModalTransaction} buttonsOptions={{cancelButton: "Cancel", okButton: "Save"}} isOpen={isTransactionDetailModalOpen} onClose={closeTransactionDetailModal} onSubmit={onTransactionDetailModalSubmit} />
      <TransactionsImportDuplicatesModal newTransactions={transactionsImportDuplicatesModalNewTransactions} duplicates={transactionsImportDuplicatesModalDuplicates} isOpen={isTransactionsImportDuplicatesModalOpen} onClose={onTransactionsImportDuplicatesModalClose} onSubmit={onTransactionsImportDuplicatesModalSubmit} />
    </div>
  );
};

export default TransactionsView;

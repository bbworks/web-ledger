import {useState, useEffect} from 'react';

import TransactionsImportForm from './../TransactionsImportForm';
import TransactionData from './../TransactionData';
import TransactionDetailModal from './../TransactionDetailModal';

import './index.scss';

const TransactionsView = ({ transactions, onImportFormSubmit, onTransactionsImportFormFileInputChange, onTransactionDetailModalSubmit:onTransactionDetailModalSubmitProp })=>{
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
        <TransactionsImportForm onImportFormSubmit={onImportFormSubmit} onFileInputChange={onTransactionsImportFormFileInputChange} />
        <TransactionData transactions={transactions} onTransactionEditButtonClick={onTransactionEditButtonClick} />
      </div>
      <TransactionDetailModal transaction={transactionDetailModalTransaction} buttonsOptions={{okButton: "Save", cancelButton: "Cancel"}} isOpen={isTransactionDetailModalOpen} onClose={closeTransactionDetailModal} onSubmit={onTransactionDetailModalSubmit} />
    </div>
  );
};

export default TransactionsView;

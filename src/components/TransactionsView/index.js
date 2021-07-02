import {useState, useEffect} from 'react';

import ImportForm from './../ImportForm';
import TransactionData from './../TransactionData';
import TransactionDetailModal from './../TransactionDetailModal';

import './index.scss';

const TransactionsView = ({ transactions, onImportFormSubmit, fileInputOnChange, transactionDetailModalOnSubmit, isTransactionDetailModalOpen, setIsTransactionDetailModalOpen })=>{
  const [transactionDetailTransaction, setTransactionDetailTransaction] = useState(null);

  useEffect(()=>{
    transactionDetailTransaction && setIsTransactionDetailModalOpen(true)
  }, [transactionDetailTransaction]);

  const transactionButtonOnClick = transaction=>{
    setTransactionDetailTransaction(transaction);
  };

  return (
    <div className="view transactions-view">
      <div className="container">
        <h1 className="display-1">Ledger</h1>
        {/* <button className="btn btn-dark" type="button" data-toggle="collapse" data-target="#transaction-import-form">Import Transactions</button> */}
        <ImportForm onImportFormSubmit={onImportFormSubmit} onFileInputChange={fileInputOnChange} />
        <TransactionData transactions={transactions} transactionButtonOnClick={transactionButtonOnClick} />
      </div>
      <TransactionDetailModal transaction={transactionDetailTransaction} buttonsOptions={{okButton: "Save", cancelButton: "Cancel"}} isOpen={isTransactionDetailModalOpen} transactionDetailModalOnSubmit={transactionDetailModalOnSubmit} />
    </div>
  );
};

export default TransactionsView;

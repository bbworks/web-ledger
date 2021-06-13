import {useState, useEffect} from 'react';

import ImportForm from './../ImportForm';
import TransactionData from './../TransactionData';
import TransactionDetailModal from './../TransactionDetailModal';

import {isFalsy, nullCoalesce, convertNumberToCurrency, convertCSVToJSON} from './../../utilities.js';
import {importTransactions, updateTransactions, fetchTransactionData, importFormOnSubmit} from './transactions.js';
import './index.css';

const App = () => {
  const [transactionData, setTransactionData] = useState(fetchTransactionData());
  const [transactions, setTransactions] = useState([]);
  const [transactionDetailTransaction, setTransactionDetailTransaction] = useState(null);
  const [isTransactionDetailModalOpen, setIsTransactionDetailModalOpen] = useState(false);

  useEffect(
    ()=>{
      console.log("Transaction data: ", transactionData);
      if (isFalsy(transactionData)) return;
      setTransactions(updateTransactions(transactionData));
    }
    , [transactionData]
  );

  useEffect(()=>{
    if(!transactions) return;
    updateTransactions(transactions)
  }, [transactions]);

  useEffect(()=>console.log("Transactions: ", transactions), [transactions]);

  const fileInputOnChange = async event=>{
    //Prevent default behavior
    event.preventDefault();

    //Get the transaction data
    const transactionDataArray = [];
    await Promise.all(  //Promise.all handles an array of Promises
      [...event.target.files].map(async file=>{
        const fileContent = await file.text();
        transactionDataArray.push(fileContent);
      })
    );

    console.log("Setting transaction data from fileInputOnChange.", transactionData);
    setTransactionData(importTransactions(transactionDataArray, "csv"));

    //Reset the file input
    event.target.value = "";
  };

  const transactionButtonOnClick = transaction=>{
    setTransactionDetailTransaction(transaction);
  };

  useEffect(()=>{
    transactionDetailTransaction && setIsTransactionDetailModalOpen(true)
  }, [transactionDetailTransaction]);

  const transactionDetailModalOnSubmit = (transaction, updatedTransaction)=>{
    const transactionIndex = transactions.indexOf(transaction);
    const updatedTransactions = [...transactions]; //create deep copy
    updatedTransactions.splice(transactionIndex, 1, updatedTransaction);

    // //Update the transactions data
    // importTransactions(updatedTransactions.map(updatedTransaction=>updatedTransaction.display));

    setTransactions(updatedTransactions);

    setIsTransactionDetailModalOpen(false);
  };

  return (
    <div className="App">
      <div className="container">
        <h1 className="display-1">Ledger</h1>
        {/* <button className="btn btn-dark" type="button" data-toggle="collapse" data-target="#transaction-import-form">Import Transactions</button> */}
        <ImportForm onImportFormSubmit={importFormOnSubmit} onFileInputChange={fileInputOnChange} />
        <TransactionData transactions={transactions} transactionButtonOnClick={transactionButtonOnClick} />
      </div>
      <TransactionDetailModal transaction={transactionDetailTransaction} buttonsOptions={{okButton: "Save", cancelButton: "Cancel"}} isOpen={isTransactionDetailModalOpen} transactionDetailModalOnSubmit={transactionDetailModalOnSubmit} />
    </div>
  );
};

export default App;

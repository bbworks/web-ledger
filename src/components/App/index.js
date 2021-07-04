import {useState, useEffect} from 'react';
import {BrowserRouter as Router, Switch, Route, Link} from 'react-router-dom';

import {isFalsy, nullCoalesce, convertNumberToCurrency, convertCSVToJSON} from './../../utilities.js';
import {importTransactions, updateTransactions, fetchTransactionData, importFormOnSubmit} from './../../transactions.js';

import DashboardView from './../DashboardView';
import BudgetsView from './../BudgetsView';
import TransactionsView from './../TransactionsView';
import FooterNavbar from './../FooterNavbar';

import './main.css';
import './index.scss';

const App = () => {
  const [transactionData, setTransactionData] = useState();
  const [transactions, setTransactions] = useState(fetchTransactionData());

  useEffect(
    ()=>{
      console.log("Updating transaction data: ", transactionData);
      if (isFalsy(transactionData)) return;
      setTransactions(updateTransactions(transactionData));
    }
    , [transactionData]
  );

  useEffect(()=>console.log("Transactions: ", transactions), [transactions]);

  const onImportFormSubmit = event=>{
    const transactions = importFormOnSubmit(event);

    //Set the new transaction data
    setTransactionData(transactions);
  };

  const onTransactionsImportFormFileInputChange = async event=>{
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

    console.log("Setting transaction data from onTransactionsImportFormFileInputChange.", transactionData);
    setTransactionData(importTransactions(transactionDataArray, "csv"));

    //Reset the file input
    event.target.value = "";
  };

  const onTransactionDetailModalSubmit = (oldTransaction, updatedTransaction)=>{
    //Update transactions with the new transaction
    const updatedTransactions = [...transactions]; //create deep copy
    updatedTransactions.splice(transactions.indexOf(oldTransaction), 1, updatedTransaction);

    setTransactionData(updatedTransactions);
  };

  return (
    <div className="App">
      <Router>
        <Switch>
          <Route path={["/dashboard", "/"]} exact>
            <DashboardView transactions={transactions} />
          </Route>
          <Route path="/budgets" exact>
            <BudgetsView transactions={transactions} />
          </Route>
          <Route path="/transactions" exact>
            <TransactionsView transactions={transactions} onImportFormSubmit={onImportFormSubmit} onTransactionsImportFormFileInputChange={onTransactionsImportFormFileInputChange} onTransactionDetailModalSubmit={onTransactionDetailModalSubmit} />
          </Route>
        </Switch>
      </Router>
      <FooterNavbar />
    </div>
  );
};

export default App;

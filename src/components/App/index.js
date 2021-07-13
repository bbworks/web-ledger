import {useState, useEffect} from 'react';
import {BrowserRouter as Router, Switch, Route, Link} from 'react-router-dom';

import {isFalsy, nullCoalesce, convertNumberToCurrency, convertCSVToJSON, getMonthFromNumber, getCurrentYear, getBillingCycleFromDate, areObjectsEqual, typeCheckTransactions, categorizeTransactionByDescription, saveTransactions, importTransactions, fetchTransactions} from './../../utilities';
import {initAuthorization} from './../../googleApi';

import SignInView from './../SignInView';
import DashboardView from './../DashboardView';
import BudgetsView from './../BudgetsView';
import TransactionsView from './../TransactionsView';
import SettingsView from './../SettingsView';
import FooterNavbar from './../FooterNavbar';

import './main.css';
import './index.scss';

const App = () => {
  //Set application state
  const initialTransactionsData = typeCheckTransactions(fetchTransactions());
  const initialBudgetsData = JSON.parse(localStorage.getItem("budgets-data"));
  const initialAccountsData = JSON.parse(localStorage.getItem("accounts-data"));
  const initialAccountData = JSON.parse(localStorage.getItem("account-data"));
  const spreadsheetData = JSON.parse(localStorage.getItem("spreadsheet-data")) || {};

  const [transactions, setTransactions] = useState(initialTransactionsData || []);
  const [budgetsData, setBudgetsData] = useState(initialBudgetsData || null);
  const [accountsData, setAccountsData] = useState(initialAccountsData || null);
  const [accountData, setAccountData] = useState(initialAccountData || null);
  const [footerNavbar, setFooterNavbar] = useState(null);
  const [budgetCycle, setBudgetCycle] = useState(getBillingCycleFromDate(new Date()));
  const [transactionsImportDuplicatesModalNewTransactions, setTransactionsImportDuplicatesModalNewTransactions] = useState([]);
  const [transactionsImportDuplicatesModalDuplicates, setTransactionsImportDuplicatesModalDuplicates] = useState([]);
  const [isTransactionsImportDuplicatesModalOpen, setIsTransactionsImportDuplicatesModalOpen] = useState(false);
  const [signedInUser, setSignedInUser] = useState(undefined);

  //Whenever the transactions are updated, save them off as well
  useEffect(()=>{
    //Save transactions to localStorage
    saveTransactions(transactions);
  }, [transactions]);

  //Log transactions
  useEffect(()=>{
    console.log("Transactions: ", transactions)
  }, [transactions]);

  //When the app starts, load the Google API
  useEffect(()=>{
    initAuthorization(onSignInChange, onSignInChange);
  }, []);

  useEffect(()=>{
    console.log("signedInUser: ", signedInUser)
  }, [signedInUser]);

  //Create state handlers
  const checkTransactionsForDuplicates = (previousTransactions, newTransactions)=>{
    //Look for possible duplicate transactions,
    // and confirm if they are duplicates (shouldn't be added),
    // or not duplicates (should be added)
    const duplicates = [];
    newTransactions.forEach(newTransaction=>{
      const duplicate = previousTransactions.find(previousTransaction=>areObjectsEqual(newTransaction, previousTransaction));
      if (duplicate) {
        duplicates.push(duplicate);
      }
    });

    //If there were no duplicates, append the new transactions
    if (!duplicates.length) return [...previousTransactions, ...newTransactions];

    //Otherwise, ask user to confirm true duplicates,
    // and just return the previous data for now
    console.log("Duplicates: ", duplicates);
    setTransactionsImportDuplicatesModalNewTransactions(transactions);
    setTransactionsImportDuplicatesModalDuplicates(duplicates);
    openTransactionsImportDuplicatesModal();

    return previousTransactions;
  };

  const setTransactionsHandler = (previousTransactions, newTransactions, callback, oldTransaction)=>{
    //If there are no new transactions, short-circuit
    if (isFalsy(newTransactions)) return previousTransactions;

    //Check that we have an array of transactions
    let transactionsArray = newTransactions;
    if (!(newTransactions instanceof Array)) transactionsArray = [newTransactions];

    //Type check transactions data to convert from strings to the correct type
    const typeCheckedTransactions = typeCheckTransactions(transactionsArray);

    //Assign category & notes from description
    const transactions = typeCheckedTransactions.map(transaction=>categorizeTransactionByDescription(transaction));

    //Call the data manipulation callback
    return callback(previousTransactions, transactions, oldTransaction);
  };

  const importTransactionsHandler = newTransactions=>{
    //Import new transactions
    setTransactions(previousTransactions=>{
      const callback = (previousTransactions, newTransactions)=>{
        //Check for duplicates, and return depending if any were found
        return checkTransactionsForDuplicates(previousTransactions, newTransactions);
      };

      //Run through transaction normalization
      return setTransactionsHandler(previousTransactions, newTransactions, callback);
    });
  };

  const updateTransactionHandler = (oldTransaction, newTransaction)=>{
    //Update a single transaction
    setTransactions(previousTransactions=>{
      const callback = (previousTransactions, newTransactions, oldTransaction)=>{
        //Get the single updated transaction wrapped in an array
        const newTransaction = newTransactions[0];

        //Update transactions with the new transaction
        const transactions = [...previousTransactions]; //create deep copy
        transactions[transactions.indexOf(oldTransaction)] = newTransaction;

        return transactions;
      };

      //Run through transaction normalization
      return setTransactionsHandler(previousTransactions, newTransaction, callback, oldTransaction);
    });
  };

  //Create event listeners
  const onTransactionsImportFormSubmit = scrapedTransactionsData=>{
    //Import the scraped transactions data
    const transactions = importTransactions(scrapedTransactionsData, "scraped");

    //Set the new transactions data
    importTransactionsHandler(transactions);
  };

  const onTransactionsImportFormFileInputChange = transactionsDataArray=>{
    //Import the csv transactions data
    const transactions = importTransactions(transactionsDataArray, "csv");

    //Set the new transactions data
    importTransactionsHandler(transactions);
  };

  const onTransactionDetailModalSubmit = (oldTransaction, updatedTransaction)=>{
    updateTransactionHandler(oldTransaction, updatedTransaction);
  };

  const openTransactionsImportDuplicatesModal = ()=>{
    setIsTransactionsImportDuplicatesModalOpen(true);
  };

  const closeTransactionsImportDuplicatesModal = ()=>{
    setIsTransactionsImportDuplicatesModalOpen(false);
  };

  const onTransactionsImportDuplicatesModalSubmit = (filteredNewTransactions)=>{
    //Update transactions with the new transaction
    setTransactions(previousTransactions=>[...previousTransactions, ...filteredNewTransactions]);

    //Reset the duplicates
    //setTransactionsImportDuplicatesModalDuplicates([]);
  };

  const onSignInChange = signInInfo=>{
    setSignedInUser(signInInfo);
  };

  //Create a "loading page" while determining if the user is signed in
  if (signedInUser === undefined) return (
    <div className="App">
      <div className="container-fluid d-flex justify-content-center align-items-center min-vh-100">
        <i className="spinner fas fa-spinner fa-lg"></i>
      </div>
    </div>
  );

  //If the user has not signed in, send them to the login page
  if (!signedInUser) return (
    <div className="App">
      <SignInView />
    </div>
  );

  return (
    <div className="App">
      <Router>
        <Switch>
          <Route path={["/dashboard", "/"]} exact>
            <DashboardView signedInUser={signedInUser} transactions={transactions} accountsData={accountsData} accountData={accountData} budgetsData={budgetsData} budgetCycle={budgetCycle} setFooterNavbar={setFooterNavbar} />
          </Route>
          <Route path="/budgets" exact>
            <BudgetsView transactions={transactions} budgetsData={budgetsData} setFooterNavbar={setFooterNavbar} />
          </Route>
          <Route path="/transactions" exact>
            <TransactionsView transactions={transactions} transactionsImportDuplicatesModalNewTransactions={transactionsImportDuplicatesModalNewTransactions} transactionsImportDuplicatesModalDuplicates={transactionsImportDuplicatesModalDuplicates} isTransactionsImportDuplicatesModalOpen={isTransactionsImportDuplicatesModalOpen} onTransactionsImportDuplicatesModalClose={closeTransactionsImportDuplicatesModal} onTransactionsImportDuplicatesModalSubmit={onTransactionsImportDuplicatesModalSubmit} onTransactionsImportFormSubmit={onTransactionsImportFormSubmit} onTransactionsImportFormFileInputChange={onTransactionsImportFormFileInputChange} onTransactionDetailModalSubmit={onTransactionDetailModalSubmit} setFooterNavbar={setFooterNavbar} />
          </Route>
          <Route path="/settings" exact>
            <SettingsView setFooterNavbar={setFooterNavbar} />
          </Route>
        </Switch>
        <FooterNavbar active={footerNavbar} />
      </Router>
    </div>
  );
};

export default App;

//Import package dependencies
import {useState, useEffect} from 'react';
import {BrowserRouter as Router, Switch, Route, Link} from 'react-router-dom';

//Import source code
import {getBudgetCycleFromDate, typeCheckTransactions, isTransactionDuplicate, categorizeTransactionByDescription, importTransactions, typeCheckBudgetsData, typeCheckAccountsData, typeCheckAccountData} from './../../utilities';
import {getSpreadsheetId, setSpreadsheetId, getClientId, setClientId, initAuthorization} from './../../googleApi';
import {getTransactions, updateTransactions, getBudgetsData, getAccountsData, getAccountData} from './../../api';
import {useScript, useConsoleLog, useLocalStorage} from './../../hooks';

//Import custom components
import SignInView from './../SignInView';
import DashboardView from './../DashboardView';
import BudgetsView from './../BudgetsView';
import TransactionsView from './../TransactionsView';
import SettingsView from './../SettingsView';
import FooterNavbar from './../FooterNavbar';

//Import styles
import './main.css';
import './index.scss';


const App = () => {
  //Set application state
  const [transactions, setTransactions] = useState([]);
  const [budgetsData, setBudgetsData] = useState([]);
  const [accountsData, setAccountsData] = useState([]);
  const [accountData, setAccountData] = useState({});

  const [footerNavbar, setFooterNavbar] = useState(null);
  const [budgetCycle, setBudgetCycle] = useState(getBudgetCycleFromDate(new Date()));
  const [transactionsImportDuplicatesModalNewTransactions, setTransactionsImportDuplicatesModalNewTransactions] = useState([]);
  const [transactionsImportDuplicatesModalDuplicates, setTransactionsImportDuplicatesModalDuplicates] = useState([]);
  const [isTransactionsImportDuplicatesModalOpen, setIsTransactionsImportDuplicatesModalOpen] = useState(false);
  const [signedInUser, setSignedInUser] = useState(undefined);

  //Log data
  useConsoleLog(transactions, "Transactions Data:");
  useConsoleLog(budgetsData, "Budget Data:");
  useConsoleLog(accountsData, "Accounts Data:");
  useConsoleLog(accountData, "Account Data:");
  useConsoleLog(signedInUser, "signedInUser:");

  //Load the Google API
  const gapiLoaded = useScript("https://apis.google.com/js/api.js");

  //When the app starts, load the Google API
  useEffect(async()=>{
    if(!gapiLoaded) return;
    initAuthorization(onSignInChange, onSignInChange);
  }, [gapiLoaded]);

  //Whenever the user gets logged in,
  // attempt to query for data
  useEffect(async ()=>{
    if (!signedInUser) return;
    setTransactionsWrapper(await getTransactions());
    setBudgetsDataWrapper(await getBudgetsData());
    setAccountsDataWrapper(await getAccountsData());
    setAccountDataWrapper(await getAccountData());
  }, [signedInUser]);

  //Whenever the transactions are updated, save them off as well
  useEffect(()=>{
    if (!transactions.length) return;
    updateTransactions(transactions);
  }, [transactions]);

  //Create state handlers
  const checkTransactionsForDuplicates = (previousTransactions, newTransactions)=>{
    if(!previousTransactions.length) return newTransactions;

    //Look for possible duplicate transactions,
    // and confirm if they are duplicates (shouldn't be added),
    // or not duplicates (should be added)
    const duplicates = [];
    newTransactions.forEach(newTransaction=>{
      const duplicate = isTransactionDuplicate(newTransaction, previousTransactions);
      if (duplicate) {
        duplicates.push(duplicate);
      }
    });

    //If there were no duplicates, append the new transactions
    if (!duplicates.length) return [...previousTransactions, ...newTransactions];

    //Otherwise, ask user to confirm true duplicates,
    // and just return the previous data for now
    console.log("Duplicates: ", duplicates);
    setTransactionsImportDuplicatesModalNewTransactions(newTransactions);
    setTransactionsImportDuplicatesModalDuplicates(duplicates);
    openTransactionsImportDuplicatesModal();

    return previousTransactions;
  };

  const setTransactionsHandler = (previousTransactions, newTransactions, callback, oldTransaction)=>{
    //If there are no new transactions, short-circuit
    if (!newTransactions || !newTransactions.length) return previousTransactions;

    //Check that we have an array of transactions
    let transactionsArray = newTransactions;
    if (!(newTransactions instanceof Array)) transactionsArray = [newTransactions];

    //Type check transactions data to convert from strings to the correct type
    const typeCheckedTransactions = typeCheckTransactions(transactionsArray);

    //Assign category & notes from description
    const transactions = typeCheckedTransactions.map(transaction=>categorizeTransactionByDescription(transaction));

    //Return the data manipulation callback result, sorted
    if (callback) return callback(previousTransactions, transactions, oldTransaction)
      .sort((a,b)=>b.TransactionDate-a.TransactionDate);

    //Otherwise, just return the transactions, sorted
    return transactions.sort((a,b)=>b.TransactionDate-a.TransactionDate);
  };

  const setTransactionsWrapper = newTransactions=>{
    //Import new transactions
    setTransactions(previousTransactions=>{
      //Run through transaction normalization
      return setTransactionsHandler(previousTransactions, newTransactions);
    });
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

  const appendTransactionsHandler = newTransactions=>{
    //Import new transactions
    setTransactions(previousTransactions=>{
      const callback = (previousTransactions, newTransactions)=>{
        //Append the new transactions
        return [...previousTransactions, ...newTransactions];
      };

      //Run through transaction normalization
      return setTransactionsHandler(previousTransactions, newTransactions, callback);
    });
  };

  const setBudgetsDataWrapper = newBudgetsData=>{
    //Import new data
    setBudgetsData(previousBudgetsData=>{
      if (!newBudgetsData) return [];

      const typeCheckedData = typeCheckBudgetsData(newBudgetsData);
      return typeCheckedData;
    });
  };

  const setAccountsDataWrapper = newAccountsData=>{
    //Import new data
    setAccountsData(previousAccountsData=>{
      if (!newAccountsData) return [];

      const typeCheckedData = typeCheckAccountsData(newAccountsData);
      return typeCheckedData;
    });
  };

  const setAccountDataWrapper = newAccountData=>{
    //Import new data
    setAccountData(previousAccountData=>{
      if (!newAccountData) return {};

      const typeCheckedData = typeCheckAccountData(newAccountData);
      return typeCheckedData;
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
    appendTransactionsHandler(filteredNewTransactions);

    //Close the modal
    closeTransactionsImportDuplicatesModal();
  };

  const onSignInChange = signInInfo=>{
    setSignedInUser(signInInfo);
  };

  const onSettingsViewSubmit = submittedData=>{
    console.log(submittedData);

    //Call the update function for each setting
    Object.entries(submittedData).forEach(([settingName, settingValue])=>
      settings[settingName].update(settingValue)
    );
  };

  //Declare settings
  const settings = {
    "Client Id": {
      value: getClientId(),
      update: clientId=>setClientId(clientId),
    },
    "Spreadsheet id": {
      value: getSpreadsheetId(),
      update: spreadsheetId=>setSpreadsheetId(spreadsheetId),
    }
  };

  //If the user has not signed in, send them to the sign in page,
  // and while the Google API is loading, disable the sign in button
  if (!signedInUser) return (
    <div className="App">
      <Router basename={(process.env.NODE_ENV === "production" ? process.env.PUBLIC_URL : null)}>
        <SignInView isReadyForSignIn={!(signedInUser===undefined)}/>
      </Router>
    </div>
  );

  return (
    <div className="App">
      <Router basename={(process.env.NODE_ENV === "production" ? process.env.PUBLIC_URL : null)}>
        <Switch>
          <Route path={["/dashboard", "/"]} exact>
            <DashboardView signedInUser={signedInUser} transactions={transactions} accountsData={accountsData} accountData={accountData} budgetsData={budgetsData} budgetCycle={budgetCycle} setFooterNavbar={setFooterNavbar} />
          </Route>
          <Route path="/budgets" exact>
            <BudgetsView transactions={transactions} budgetsData={budgetsData} budgetCycle={budgetCycle} setFooterNavbar={setFooterNavbar} />
          </Route>
          <Route path="/transactions" exact>
            <TransactionsView transactions={transactions} budgetCycle={budgetCycle} transactionsImportDuplicatesModalNewTransactions={transactionsImportDuplicatesModalNewTransactions} transactionsImportDuplicatesModalDuplicates={transactionsImportDuplicatesModalDuplicates} isTransactionsImportDuplicatesModalOpen={isTransactionsImportDuplicatesModalOpen} onTransactionsImportDuplicatesModalClose={closeTransactionsImportDuplicatesModal} onTransactionsImportDuplicatesModalSubmit={onTransactionsImportDuplicatesModalSubmit} onTransactionsImportFormSubmit={onTransactionsImportFormSubmit} onTransactionsImportFormFileInputChange={onTransactionsImportFormFileInputChange} onTransactionDetailModalSubmit={onTransactionDetailModalSubmit} setFooterNavbar={setFooterNavbar} />
          </Route>
          <Route path="/settings" exact>
            <SettingsView setFooterNavbar={setFooterNavbar} settings={settings} onSubmit={onSettingsViewSubmit}/>
          </Route>
        </Switch>
        <FooterNavbar active={footerNavbar} />
      </Router>
    </div>
  );
};

export default App;

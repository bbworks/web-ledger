//Import package dependencies
import {useState, useEffect} from 'react';
import {BrowserRouter as Router, Switch, Route} from 'react-router-dom';

//Import source code
import {getBudgetCycleFromDate, getBudgetCyclesFromTransactions, typeCheckTransactions, isTransactionDuplicate, categorizeTransactionByDescription, importTransactions, typeCheckBudgetsData, typeCheckAccountsData, typeCheckAccountData, throwException} from './../../utilities';
import {getSpreadsheetId, setSpreadsheetId, getClientId, setClientId, initAuthorization} from './../../googleApi';
import {getTransactions, updateTransactions, getBudgetsData, getAccountsData, getAccountData} from './../../api';
import {useScript, useConsoleLog} from './../../hooks';

//Import custom components
import SignInView from './../SignInView';
import DashboardView from './../DashboardView';
import BudgetsView from './../BudgetsView';
import TransactionsView from './../TransactionsView';
import SettingsView from './../SettingsView';
import FooterNavbar from './../FooterNavbar';
import SignInSettingsModal from './../SignInSettingsModal';
import Header from './../Header';

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
  const [transactionsImportConfirmedModalTransactions, setTransactionsImportConfirmedModalTransactions] = useState([]);
  const [isTransactionsImportConfirmedModalOpen, setIsTransactionsImportConfirmedModalOpen] = useState(false);
  const [signedInUser, setSignedInUser] = useState(undefined);
  const [isSignInSettingsModalOpen, setIsSignInSettingsModalOpen] = useState(false);

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

  const transactionCategories = [
    null,
    "Savings",
    "Gas",
    "Church",
    "Groceries/Necessities",
    "LoveInAction",
    "Family Outings",
    "Personal Spending",
    "Miscellaneous",
    "Sharonview mortgage & escrow",
    "HOA dues",
    "Duke Energy",
    "SJWD Water District",
    "Piedmont Natural Gas",
    "Kirby Sanitation",
    "Laurens Electric ProTec Security",
    "SimpliSafe (for mom)",
    "AT&T Internet",
    "State Farm auto insurance",
    "AT&T phone bill",
    "Spotify Premium subscription",
    "Netflix Premium subscription",
    "Discovery Plus subscription",
    "YMCA membership",
  ];

  const transactionTypes = [
    null,
    //Credit card
    "Charges",     //-
    "Payments",    //+

    //Checking/Savings
    "Debit",       //-
    "Credit",      //+
    "Withdrawal",  //-
    "Deposit",     //+
    "Transfer",    //+/-
    "Payment",     //-
  ];

  const getAllBudgetCycles = transactions=>{
    if (!transactions.length) return [];

    const todayBudgetCycle = getBudgetCycleFromDate(new Date());

    return [
      ...new Set([
        todayBudgetCycle, //assure the current month is an option as well
        ...getBudgetCyclesFromTransactions(transactions),
      ].map(date=>date.getTime()))
    ]
      .sort((a,b)=>b-a)
      .map(epochTime=>new Date(epochTime));
  };

  const [allBudgetCycles, setAllBudgetCycles] = useState(getAllBudgetCycles(transactions));

  //Check that the list of budget cycles remains updated with transaction data
  useEffect(()=>
    setAllBudgetCycles(getAllBudgetCycles(transactions))
  , [transactions]);



  //Log data
  useConsoleLog(transactions, "Transactions Data:");
  useConsoleLog(budgetsData, "Budget Data:");
  useConsoleLog(accountsData, "Accounts Data:");
  useConsoleLog(accountData, "Account Data:");
  useConsoleLog(signedInUser, "signedInUser:");
  useConsoleLog(allBudgetCycles, "allBudgetCycles:");
  useConsoleLog(budgetCycle, "budgetCycle:");

  const gapiLoaded = useScript("https://apis.google.com/js/api.js");

  //Create helper functions
  const saveSettings = savedSettings=>{
    //Call the update function for each setting
    Object.entries(savedSettings).forEach(([settingName, settingValue])=>
      settings[settingName].update(settingValue)
    );
  };

  const connectToGoogleAPI = async ()=>{
    if(!gapiLoaded) return;

    //Try to initialize the Google API
    try {
      initAuthorization(onSignInChange, onSignInChange);
    }
    catch (err) {
      //If credentials weren't found, prompt the user for the credentials
      if (err.name === "CredentialsNotFoundError") {
        return openSignInSettingsModal();
        // throw new Error("Failed to get authorization credentials.");
      }
      return throwException(err);
    }
  };

  const onBudgetCycleChange = budgetCycle=>{
    setBudgetCycle(budgetCycle);
  };

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

    //If there were no duplicates,
    // open the confirmed imported transactions modal
    if (!duplicates.length) {
      console.log("confirmedTransactions: ", newTransactions);
      setTransactionsImportConfirmedModalTransactions(newTransactions);
      openTransactionsImportConfirmedModal();
      return previousTransactions;
    }

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
    if ((Array.isArray(newTransactions) ? !newTransactions.length : newTransactions !== false && !newTransactions)) return previousTransactions;

    //If there are new transactions, massage them
    let transactions;
    if (newTransactions) {
      //Check that we have an array of transactions
      let transactionsArray = newTransactions;
      if (!(newTransactions instanceof Array)) transactionsArray = [newTransactions];

      //Type check transactions data to convert from strings to the correct type
      const typeCheckedTransactions = typeCheckTransactions(transactionsArray);

      //Assign category & notes from description
      transactions = typeCheckedTransactions.map(transaction=>categorizeTransactionByDescription(transaction));
    }

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

  const importTransactionsWrapper = newTransactions=>{
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

  const insertTransactionsWrapper = newTransactions=>{
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

  const updateTransactionWrapper = (oldTransaction, newTransaction)=>{
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

  const deleteTransactionWrapper = deletedTransaction=>{
    //Delete a single transaction
    setTransactions(previousTransactions=>{
      const callback = (previousTransactions, transaction, deletedTransaction)=>{
        //Update transactions with the new transaction
        const transactions = [...previousTransactions]; //create deep copy
        const index = transactions.indexOf(deletedTransaction);
        transactions.splice(index, 1);

        return transactions;
      };

      //Run through transaction normalization
      return setTransactionsHandler(previousTransactions, false, callback, deletedTransaction);
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
    importTransactionsWrapper(transactions);
  };

  const onTransactionsImportFormFileInputChange = transactionsDataArray=>{
    //Import the csv transactions data
    const transactions = importTransactions(transactionsDataArray, "csv");

    //Set the new transactions data
    importTransactionsWrapper(transactions);
  };

  const onTransactionDetailModalSubmit = (oldTransaction, updatedTransaction)=>{
    updateTransactionWrapper(oldTransaction, updatedTransaction);
  };

  const onTransactionDeleteModalSubmit = deletedTransaction=>{
    deleteTransactionWrapper(deletedTransaction);
  };

  const openTransactionsImportDuplicatesModal = ()=>{
    setIsTransactionsImportDuplicatesModalOpen(true);
  };

  const closeTransactionsImportDuplicatesModal = ()=>{
    setIsTransactionsImportDuplicatesModalOpen(false);
  };

  const onTransactionsImportDuplicatesModalSubmit = (filteredNewTransactions)=>{
    //Close the modal
    closeTransactionsImportDuplicatesModal();

    //Open the confirmed imported transactions modal
    setTransactionsImportConfirmedModalTransactions(filteredNewTransactions);
    openTransactionsImportConfirmedModal();
  };

  const openTransactionsImportConfirmedModal = ()=>{
    setIsTransactionsImportConfirmedModalOpen(true);
  };

  const closeTransactionsImportConfirmedModal = ()=>{
    setIsTransactionsImportConfirmedModalOpen(false);
  };

  const onTransactionsImportConfirmedModalSubmit = confirmedTransactions=>{
    //Update transactions with the new transaction
    insertTransactionsWrapper(confirmedTransactions);

    //Close the modal
    closeTransactionsImportConfirmedModal();
  };

  const onSignInChange = signInInfo=>{
    setSignedInUser(signInInfo);
  };

  const onSettingsViewSubmit = submittedSettings=>{
    saveSettings(submittedSettings);
  };

  const openSignInSettingsModal = ()=>{
    setIsSignInSettingsModalOpen(true);
  };

  const closeSignInSettingsModal = ()=>{
    setIsSignInSettingsModalOpen(false);

    //Re-attempt to initialize Google API again
    connectToGoogleAPI();
  };

  const onSignInSettingsModalSubmit = submittedSettings=>{
    saveSettings(submittedSettings);
  };

  //When the Google API JS library loads, initialize the Google API
  useEffect(()=>
    connectToGoogleAPI()
    , [gapiLoaded]);

  //Whenever the user gets logged in,
  // attempt to query for data
  useEffect(()=>{
    //Run async function inside necessary useEffect sync function
    (async ()=>{
      if (!signedInUser) return;
      setTransactionsWrapper(await getTransactions());
      setBudgetsDataWrapper(await getBudgetsData());
      setAccountsDataWrapper(await getAccountsData());
      setAccountDataWrapper(await getAccountData());
    })();
  }, [signedInUser]);

  //Whenever the transactions are updated, save them off as well
  useEffect(()=>{
    if (!transactions.length) return;
    updateTransactions(transactions);
  }, [transactions]);


  //If the user has not signed in, send them to the sign in page,
  // and while the Google API is loading, disable the sign in button
  if (!signedInUser) return (
    <div className="App">
      <Router basename={(process.env.NODE_ENV === "production" ? process.env.PUBLIC_URL : null)}>
        <SignInView isReadyForSignIn={!(signedInUser===undefined)}/>
        <SignInSettingsModal settings={settings} isOpen={isSignInSettingsModalOpen} onClose={closeSignInSettingsModal} onSubmit={onSignInSettingsModalSubmit} />
      </Router>
    </div>
  );

  return (
    <div className="App">
      <Router basename={(process.env.NODE_ENV === "production" ? process.env.PUBLIC_URL : null)}>
        <Header signedInUser={signedInUser} />
        <Switch>
          <Route path={["/dashboard", "/"]} exact>
            <DashboardView signedInUser={signedInUser} transactions={transactions} accountsData={accountsData} accountData={accountData} budgetsData={budgetsData} budgetCycle={budgetCycle} allBudgetCycles={allBudgetCycles} onBudgetCycleChange={onBudgetCycleChange} setFooterNavbar={setFooterNavbar} />
          </Route>
          <Route path="/budgets" exact>
            <BudgetsView transactions={transactions} budgetsData={budgetsData} budgetCycle={budgetCycle} setFooterNavbar={setFooterNavbar} />
          </Route>
          <Route path="/transactions" exact>
            <TransactionsView transactions={transactions} budgetCycle={budgetCycle} allBudgetCycles={allBudgetCycles} transactionsImportDuplicatesModalNewTransactions={transactionsImportDuplicatesModalNewTransactions} transactionsImportDuplicatesModalDuplicates={transactionsImportDuplicatesModalDuplicates} isTransactionsImportDuplicatesModalOpen={isTransactionsImportDuplicatesModalOpen} onTransactionsImportDuplicatesModalClose={closeTransactionsImportDuplicatesModal} onTransactionsImportDuplicatesModalSubmit={onTransactionsImportDuplicatesModalSubmit} onTransactionsImportFormSubmit={onTransactionsImportFormSubmit} onTransactionsImportFormFileInputChange={onTransactionsImportFormFileInputChange} onTransactionDetailModalSubmit={onTransactionDetailModalSubmit} onTransactionDeleteModalSubmit={onTransactionDeleteModalSubmit} transactionsImportConfirmedModalTransactions={transactionsImportConfirmedModalTransactions} isTransactionsImportConfirmedModalOpen={isTransactionsImportConfirmedModalOpen} closeTransactionsImportConfirmedModal={closeTransactionsImportConfirmedModal} onTransactionsImportConfirmedModalSubmit={onTransactionsImportConfirmedModalSubmit} setFooterNavbar={setFooterNavbar} transactionCategories={transactionCategories} transactionTypes={transactionTypes}/>
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

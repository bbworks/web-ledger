//Import package dependencies
import {useState, useEffect} from 'react';
import {BrowserRouter as Router, Switch, Route} from 'react-router-dom';

//Import source code
import {getBudgetCycleFromDate, getBudgetCyclesFromTransactions, getAllBudgetCycles, typeCheckTransactions, isTransactionDuplicate, categorizeTransactionByDescription, importTransactions, typeCheckBudgetsData, typeCheckAccountsData, typeCheckAccountData, throwException, getObjectUpdates} from './../../utilities';
import {getTransactions, updateTransactions, getBudgetsData, updateBudgetsData, getAccountsData, getAccountData} from './../../api';
import {useScript, useConsoleLog, useBudgetCycleBudgets, useApi, useFetch} from './../../hooks';

//Import custom components
import SignInView from './../SignInView';
import DashboardView from './../DashboardView';
import BudgetsView from './../BudgetsView';
import TransactionsView from './../TransactionsView';
import SettingsView from './../SettingsView';
import FooterNavbar from './../FooterNavbar';
import SignInSettingsModal from './../SignInSettingsModal';
import Header from './../Header';
import Logo from './../Logo';
import AlertsContainer from './../AlertsContainer';

//Import styles
import './main.css';
import './index.scss';


const App = () => {
  //Note whenever the entire App re-renders
  useEffect(()=>{
    console.log(">>Application re-rendered.")
  });

  //Set application state
  const [transactions, setTransactions] = useState([]);
  const [budgetsData, setBudgetsData] = useState([]);
  const [accountsData, setAccountsData] = useState([]);
  const [accountData, setAccountData] = useState({});

  const {data:transactionsApi, loading:transactionsLoading, error:transactionsError, fetchApi:fetchTransactions} = useApi(getTransactions, []);
  const {data:budgetsDataApi, loading:budgetsDataLoading, error:budgetsDataError, fetchApi:fetchBudgetsData} = useApi(getBudgetsData, []);
  const {data:accountsDataApi, loading:accountsDataLoading, error:accountsDataError, fetchApi:fetchAccountsData} = useApi(getAccountsData, []);
  const {data:accountDataApi, loading:accountDataLoading, error:accountDataError, fetchApi:fetchAccountData} = useApi(async ()=>await getAccountData(signedInUser && signedInUser.id), []);
  
  const {data: createTransactionResponse, error: createTransactionError, isLoading: createTransactionLoading, fetchData: createTransaction, status: createTransactionStatus, ok: createTransactionOk} = useFetch();
  const {data: updateTransactionResponse, error: updateTransactionError, isLoading: updateTransactionLoading, fetchData: updateTransaction, status: updateTransactionStatus, ok: updateTransactionOk} = useFetch();
  const {data: deleteTransactionResponse, error: deleteTransactionError, isLoading: deleteTransactionLoading, fetchData: deleteTransaction, status: deleteTransactionStatus, ok: deleteTransactionOk} = useFetch();
  const {data: bulkResponse, error: bulkError, isLoading: bulkLoading, fetchData: bulkOperation, status: bulkStatus, ok: bulkOk} = useFetch();
  const {data: createBudgetResponse, error: createBudgetError, isLoading: createBudgetLoading, fetchData: createBudget, status: createBudgetStatus, ok: createBudgetOk} = useFetch();
  
  const [footerNavbar, setFooterNavbar] = useState(null);
  const [budgetCycle, setBudgetCycle] = useState(getBudgetCycleFromDate(new Date()));
  const [transactionsImportDuplicatesModalNewTransactions, setTransactionsImportDuplicatesModalNewTransactions] = useState([]);
  const [transactionsImportDuplicatesModalDuplicates, setTransactionsImportDuplicatesModalDuplicates] = useState([]);
  const [isTransactionsImportDuplicatesModalOpen, setIsTransactionsImportDuplicatesModalOpen] = useState(false);
  const [transactionsImportConfirmedModalTransactions, setTransactionsImportConfirmedModalTransactions] = useState([]);
  const [isTransactionsImportConfirmedModalOpen, setIsTransactionsImportConfirmedModalOpen] = useState(false);
  const [signedInUser, setSignedInUser] = useState(undefined);
  const [isSignInSettingsModalOpen, setIsSignInSettingsModalOpen] = useState(false);
  const [isLoadingAnimationComplete, setIsLoadingAnimationComplete] = useState(false);
  const [alerts, setAlerts] = useState([]);

  //Declare settings
  const settings = {
    // "Setting Name": {
    //   value: getSettingValue(),
    //   update: newValue=>setSetting(newValue),
    // }
  };

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

  const budgetTypes = [
    null,
    "income",   //+
    "expense",  //-
    "savings",  //+
    "bill",     //-
  ];

  const budgetGroups = [
    null,
    "Income",
    "Housing",
    "Auto & Transportation",
    "Utilities & Services",
    "Subscriptions & Memberships",
    "Giving",
    "Savings",
    "Food & Dining",
    "Children",
    "Personal",
    "Miscellaneous",
    "Loans",
  ];

  const [allBudgetCycles, setAllBudgetCycles] = useState(getAllBudgetCycles(transactions));
  const budgetCycleBudgets = useBudgetCycleBudgets(budgetsData, budgetCycle);
  const transactionCategories = [null, ...new Set(budgetsData.map(b=>b.Name).sort())];

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

  useConsoleLog(transactionsApi, "TransactionsAPI:");
  useConsoleLog(budgetsDataApi, "BudgetAPI:");
  useConsoleLog(accountsDataApi, "AccountsAPI:");
  useConsoleLog(accountDataApi, "AccountAPI:");
  useConsoleLog(
    {
      createTransactionResponse,
      createTransactionError,
      createTransactionLoading,
      createTransactionStatus,
      createTransactionOk,
    }, 
    "createTransaction"
  );
  useConsoleLog(
    {
      updateTransactionResponse,
      updateTransactionError,
      updateTransactionLoading,
      updateTransactionStatus,
      updateTransactionOk,
    }, 
    "updateTransaction"
  );
  useConsoleLog(
    {
      deleteTransactionResponse,
      deleteTransactionError,
      deleteTransactionLoading,
      deleteTransactionStatus,
      deleteTransactionOk,
    }, 
    "deleteTransaction"
  );
  useConsoleLog(
    {
      createBudgetResponse,
      createBudgetError,
      createBudgetLoading,
      createBudgetStatus,
      createBudgetOk,
    }, 
    "createBudget"
  );
  useConsoleLog(
    {
      bulkResponse,
      bulkError,
      bulkLoading,
      bulkStatus,
      bulkOk,
    }, 
    "bulkOperation"
  );

  //Create helper functions
  const saveSettings = savedSettings=>{
    //Call the update function for each setting
    Object.entries(savedSettings).forEach(([settingName, settingValue])=>
      settings[settingName].update(settingValue)
    );
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
      return;
    }

    //Otherwise, ask user to confirm true duplicates,
    // and just return the previous data for now
    console.log("Duplicates: ", duplicates);
    setTransactionsImportDuplicatesModalNewTransactions(newTransactions);
    setTransactionsImportDuplicatesModalDuplicates(duplicates);
    openTransactionsImportDuplicatesModal();

    return;
  };

  
  // Create state update functions
  const setDatabaseStateWrapper = async (setState, setStateHandler, previousState, newState, replacedState, callback, apiRequest, apiValidation)=>{
    //If there is no new state, short-circuit before updating state
    if ((Array.isArray(newState) ? !newState.length : newState !== false && !newState)) return;

    let newStateApiResults;
  
    //If there is an API request to update the database, call it
    if (apiRequest && apiRequest instanceof Function) {
      try {
        newStateApiResults = await apiRequest(newState);
        
        //Validate the response
        if (apiValidation && apiValidation instanceof Function) apiValidation(newStateApiResults);

        newStateApiResults = newStateApiResults.data;
      }
      catch (err) {
        console.error(new Error("An error occurred."));
        return new Error("An error occurred.");
      }
    }
    else {
      newStateApiResults = newState;
    }

    //After successfully updating the database,
    // continue with updating the UI with the new state
    
    //Run through state normalization
    setState(await setStateHandler(previousState, newStateApiResults, callback, replacedState));
  };
  
  const setTransactionsHandler = async (previousTransactions, newTransactions, callback, oldTransaction)=>{
    //If there are no new transactions, short-circuit
    if ((Array.isArray(newTransactions) ? !newTransactions.length : newTransactions !== false && !newTransactions)) return previousTransactions;

    //If there are new transactions, massage them
    let transactions;
    if (newTransactions) {
      //Check that we have an array of transactions
      const transactionsArray = (!Array.isArray(newTransactions) ? [newTransactions] : newTransactions);

      //Type check transactions data to convert from strings to the correct type
      const typeCheckedTransactions = typeCheckTransactions(transactionsArray);

      //Assign category & notes from description
      transactions = typeCheckedTransactions.map(transaction=>categorizeTransactionByDescription(transaction));
    }

    //Return the data manipulation callback result, sorted
    if (callback) return (await callback(previousTransactions, transactions, oldTransaction))
      .sort((a,b)=>b.TransactionDate-a.TransactionDate);

    //Otherwise, just return the transactions, sorted
    return transactions.sort((a,b)=>b.TransactionDate-a.TransactionDate);
  };

  const setTransactionsWrapper = async (previousTransactions, newTransactions)=>{
    //Run through transaction normalization
    setDatabaseStateWrapper(setTransactions, setTransactionsHandler, previousTransactions, newTransactions);
  };

  const importTransactionsWrapper = async (previousTransactions, newTransactions)=>{
    const callback = async (previousTransactions, newTransactions)=>{
      //Check for duplicates, and return depending if any were found
      return checkTransactionsForDuplicates(previousTransactions, newTransactions);
    };
    
    //Run through transaction normalization
    setDatabaseStateWrapper(setTransactions, setTransactionsHandler, previousTransactions, newTransactions, null, callback );//, apiRequest, apiValidation);
  };

  const insertTransactionsWrapper = async (previousTransactions, newTransactions)=>{
    const apiRequest = async (newTransactions)=>{
      //If not an Array, call the create API
      const newTransaction = (!Array.isArray(newTransactions) ? newTransactions : (newTransactions.length === 1 ? newTransactions[0] : undefined));
      if(newTransaction) {
        const body = {
          transaction: newTransaction,
        };
        return createTransaction(`${process.env.REACT_APP_API_ENDPOINT ?? ''}/api/v1/transactions`, "POST", body);
      }

      //Otherwise, call the bulk API
      const body = {
        operations: newTransactions.map(newTransaction=>({
          method: "POST",
          endpoint: "/api/v1/transactions",
          data: {
            transaction: newTransaction,
          },
        })),
      };
      return bulkOperation(`${process.env.REACT_APP_API_ENDPOINT ?? ''}/api/v1/bulk`, "POST", body);
    };
    
    const apiValidation = (results)=>{
      //Validate that no errored records were returned
      //for(const erroredTransaction of erroredTransactions) {throwErrors(erroredTransaction);}
      const erroredTransactions = (!Array.isArray(results.data) ? [results.data] : results.data).filter(d=>d.error);
      if (erroredTransactions.length) throw new Error (`API request failed with the following errors: ${erroredTransactions.join("\r\n")}`);
    };
    
    const callback = async (previousTransactions, newTransactions)=>{
      //Append the new, non-errored transactions
      return [...previousTransactions, ...newTransactions];
    };
    
    //Run through transaction normalization
    setDatabaseStateWrapper(setTransactions, setTransactionsHandler, previousTransactions, newTransactions, undefined, callback, apiRequest, apiValidation);
  };

  const updateTransactionWrapper = async (previousTransactions, oldTransaction, updatedTransaction)=>{
    const apiRequest = async (updatedTransaction)=>{
      const body = {
        transaction: updatedTransaction,
        updates: getObjectUpdates(oldTransaction, updatedTransaction),
      };
      return updateTransaction(`${process.env.REACT_APP_API_ENDPOINT ?? ''}/api/v1/transactions/${updatedTransaction.TransactionDetailId}`, "PUT", body);
    };
    
    const apiValidation = (result)=>{
      //Validate that no errored records were returned
      //for(const erroredTransaction of erroredTransactions) {throwErrors(erroredTransaction);}
      if (!result.data) throw new Error(`API request failed with the following errors: ${result.data}`);
    };
    
    const callback = async (previousTransactions, newTransactions, oldTransaction)=>{
      //Get the single updated transaction wrapped in an array
      const updatedTransaction = newTransactions[0];
      
      //Create a deep copy of the transactions (a new Array, not a pointer that will mutate the previous one)
      const transactions = [...previousTransactions];
      
      //Replace the old transaction with the new one
      transactions[transactions.indexOf(oldTransaction)] = updatedTransaction;
      
      return transactions;
    };

    //Run through transaction normalization
    setDatabaseStateWrapper(setTransactions, setTransactionsHandler, previousTransactions, updatedTransaction, oldTransaction, callback, apiRequest, apiValidation);
  };

  const deleteTransactionWrapper = async (previousTransactions, deletedTransaction)=>{
    const apiRequest = async (newTransactions)=>{
      return deleteTransaction(`${process.env.REACT_APP_API_ENDPOINT ?? ''}/api/v1/transactions/${deletedTransaction.TransactionId}`, "DELETE");
    };
    
    const apiValidation = (newTransactions)=>{};
    
    const callback = async (previousTransactions, transaction, deletedTransaction)=>{
      //Create a deep copy of the transactions (a new Array, not a pointer that will mutate the previous one)
      const transactions = [...previousTransactions];
      
      //Find the index of the deleted transaction
      const index = transactions.indexOf(deletedTransaction);
     
      //Remove the transaction
      transactions.splice(index, 1);
      
      return transactions;
    };
    
    //Run through transaction normalization
    setDatabaseStateWrapper(setTransactions, setTransactionsHandler, previousTransactions, false, deletedTransaction, callback, apiRequest, apiValidation);
  };

  const setBudgetsHandler = async (previousBudgets, newBudgets, callback)=>{
    //If there are no new budgets, short-circuit
    if ((Array.isArray(newBudgets) ? !newBudgets.length : newBudgets !== false && !newBudgets)) return previousBudgets;

    //If there are new budgets, massage them
    let budgets;
    if (newBudgets) {
      //Check that we have an array of budgets
      const budgetsArray = (!Array.isArray(newBudgets) ? [newBudgets] : newBudgets);

      //Type check budgets data to convert from strings to the correct type
      budgets = typeCheckTransactions(budgetsArray);
    }

    //Return the data manipulation callback result, sorted
    if (callback) return (await callback(previousBudgets, budgets))
      .sort((a,b)=>b.BudgetCycle-a.BudgetCycle);

    //Otherwise, just return the budgets, sorted
    return budgets.sort((a,b)=>b.BudgetCycle-a.BudgetCycle);
  };

  const setBudgetsDataWrapper = async (previousBudgets, newBudgets)=>{
    //Run through budget normalization
    setDatabaseStateWrapper(setBudgetsData, setBudgetsHandler, previousBudgets, newBudgets);
  };

  const createBudgetsWrapper = async (previousBudgets, newBudgets)=>{
    const apiRequest = async (newBudgets)=>{
      //If not an Array, call the create API
      const newBudget = (!Array.isArray(newBudgets) ? newBudgets : (newBudgets.length === 1 ? newBudgets[0] : undefined));
      if(newBudget) {
        const body = {
          budget: newBudget,
        };
        return createBudget(`${process.env.REACT_APP_API_ENDPOINT ?? ''}/api/v1/budgets`, "POST", body);
      }

      //Otherwise, call the bulk API
      const body = {
        operations: newBudgets.map(newBudget=>({
          method: "POST",
          endpoint: "/api/v1/budgets",
          data: {
            budget: newBudget,
          },
        })),
      };
      return bulkOperation(`${process.env.REACT_APP_API_ENDPOINT ?? ''}/api/v1/bulk`, "POST", body);
    };
      
    const apiValidation = (results)=>{
      //Validate that no errored records were returned
      //for(const erroredBudget of erroredBudgets) {throwErrors(erroredBudget);}
      const erroredBudgets = (!Array.isArray(results.data) ? [results.data] : results.data).filter(d=>d.error);
      if (erroredBudgets.length) throw new Error (`API request failed with the following errors: ${erroredBudgets.join("\r\n")}`);
    };
    
    const callback = async (previousBudgets, newBudgets)=>{
      //Append the new, non-errored budgets
      return [...previousBudgets, ...newBudgets];
    };
    
    //Run through budget normalization
    setDatabaseStateWrapper(setBudgetsData, setBudgetsHandler, previousBudgets, newBudgets, undefined, callback, apiRequest, apiValidation);
  };

  const setAccountsDataWrapper = newAccountsData=>{
    //Import new data
    if (!newAccountsData) return [];
    
    const typeCheckedData = typeCheckAccountsData(newAccountsData);
    setAccountsData(typeCheckedData);
  };

  const setAccountDataWrapper = newAccountData=>{
    //Import new data
    if (!newAccountData) return {};
    
    const typeCheckedData = typeCheckAccountData(newAccountData);
    setAccountData(typeCheckedData);
  };


  //Create event listeners
  const onTransactionsImportFormSubmit = (previousTransactions, scrapedTransactionsData)=>{
    //Import the scraped transactions data
    const transactions = importTransactions(scrapedTransactionsData, "scraped");

    //Set the new transactions data
    importTransactionsWrapper(previousTransactions, transactions);
  };

  const onTransactionsImportFormFileInputChange = (previousTransactions, transactionsDataArray)=>{
    //Import the csv transactions data
    const transactions = importTransactions(transactionsDataArray, "csv");

    //Set the new transactions data
    importTransactionsWrapper(previousTransactions, transactions);
  };

  const onTransactionDetailModalSubmit = (previousTransactions, oldTransaction, updatedTransaction)=>{
    updateTransactionWrapper(previousTransactions, oldTransaction, updatedTransaction);
  };

  const onTransactionDeleteModalSubmit = (previousTransactions, deletedTransaction)=>{
    deleteTransactionWrapper(previousTransactions, deletedTransaction);
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

  const onTransactionsImportConfirmedModalSubmit = (previousTransactions, confirmedTransactions)=>{
    //Update transactions with the new transaction
    insertTransactionsWrapper(previousTransactions, confirmedTransactions);

    //Close the modal
    closeTransactionsImportConfirmedModal();
  };

  const onNewBudgetModalSubmit = (previousBudgets, newBudget)=>{
    createBudgetsWrapper(previousBudgets, newBudget);
  };

  const onCloneBudgetModalSubmit = (previousBudgets, newBudgets)=>{
    createBudgetsWrapper(previousBudgets, newBudgets);
  };

  const onNewTransactionModalSubmit =(previousTransactions, newTransaction)=>{
    insertTransactionsWrapper(previousTransactions, newTransaction);
  };

  const onLogoTextScrollIn = ()=>{
    setIsLoadingAnimationComplete(true);
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
    // connectToGoogleAPI();
  };

  const onSignInSettingsModalSubmit = submittedSettings=>{
    saveSettings(submittedSettings);
  };


  const onLogOut = async ()=>{
    try {
      const results = await fetch(`${process.env.REACT_APP_API_ENDPOINT || ""}/api/v1/authorize/logout`, {method: "post"}).then(response=>{if(!response.ok) throw response; return response;}).then(response=>response.json());
    }
    catch (err) {
      // return throwException(err);
    }
    finally {
      onSignInChange(null);
    }
  };

  //When the app loads, attempt to get the user credential
  useEffect(()=>{
    (async ()=>{
      //Try to initialize the Google API
      try {
        const results = await fetch(`${process.env.REACT_APP_API_ENDPOINT || ""}/api/v1/authorize/login`, {method: "post"}).then(response=>{if(!response.ok) throw response; return response;}).then(response=>response.json());
        onSignInChange(results);
      }
      catch (err) {
        //If credentials weren't found, prompt the user for the credentials
        if (err.name === "CredentialsNotFoundError") {
          return openSignInSettingsModal();
          // throw new Error("Failed to get authorization credentials.");
        }
        // return throwException(err);
      }
    })()
  }, []);

  //Whenever the user gets logged in,
  // refresh the API data
  useEffect(()=>{
      if (!signedInUser) return;

      fetchTransactions();
      fetchBudgetsData();
      fetchAccountsData();
      fetchAccountData();
  }, [signedInUser]);

  //Whenever the API data changes,
  // update the application state
  useEffect(()=>{
      if (!transactionsApi.length) return;
      setTransactionsWrapper(transactions, transactionsApi);
  }, [transactionsApi]);
  useEffect(()=>{
      if (!budgetsDataApi.length) return;
      setBudgetsDataWrapper(budgetsData, budgetsDataApi);
  }, [budgetsDataApi]);
  useEffect(()=>{
      if (!accountsDataApi.length) return;
      setAccountsDataWrapper(accountsDataApi);
  }, [accountsDataApi]);
  useEffect(()=>{
      if (!accountDataApi.length) return;
      setAccountDataWrapper(accountDataApi);
  }, [accountDataApi]);

  // //Whenever the transactions are updated, save them off as well
  // useEffect(()=>{
  //   if (!transactions.length) return;
  //   fetchUpdateTransactions(transactions);
  // }, [transactions]);
  //
  //
  // //Whenever the budgets are updated, save them off as well
  // useEffect(()=>{
  //   if (!budgetsData.length) return;
  //   fetchUpdateBudgetsData(budgetsData);
  // }, [budgetsData]);


  const renderApplicationUI = ()=>{
    //Return a "loading page" while determining if the user is signed in
    if (!isLoadingAnimationComplete) return (
      <>
        <div className="d-flex justify-content-center align-items-center min-vh-100">
          <Logo scrollIn={true} onLogoTextScrollIn={onLogoTextScrollIn}/>
        </div>
      </>
    );

    //If the user has not signed in, send them to the sign in page,
    // and while the Google API is loading, disable the sign in button
    if (isLoadingAnimationComplete && !signedInUser) return (
      <>
        <SignInView />
        <SignInSettingsModal settings={settings} isOpen={isSignInSettingsModalOpen} onClose={closeSignInSettingsModal} onSubmit={onSignInSettingsModalSubmit} />
      </>
    );

    //Otherwise, return the standard application UI
    return (
      <>
        <Header signedInUser={signedInUser} onLogOut={onLogOut} />
        <Switch>
          <Route path={["/dashboard", "/"]} exact>
            <DashboardView signedInUser={signedInUser} transactions={transactions} accountsData={accountsData} accountData={accountData} budgetsData={budgetsData} budgetCycle={budgetCycle} allBudgetCycles={allBudgetCycles} onBudgetCycleChange={onBudgetCycleChange} setFooterNavbar={setFooterNavbar} />
          </Route>
          <Route path="/budgets" exact>
            <BudgetsView transactions={transactions} budgetsData={budgetsData} budgetCycle={budgetCycle} allBudgetCycles={allBudgetCycles} onBudgetCycleChange={onBudgetCycleChange} setFooterNavbar={setFooterNavbar} budgetTypes={budgetTypes} budgetGroups={budgetGroups} onNewBudgetModalSubmit={onNewBudgetModalSubmit} onCloneBudgetModalSubmit={onCloneBudgetModalSubmit} />
          </Route>
          <Route path="/transactions" exact>
            <TransactionsView transactions={transactions} budgetCycle={budgetCycle} allBudgetCycles={allBudgetCycles} transactionsImportDuplicatesModalNewTransactions={transactionsImportDuplicatesModalNewTransactions} transactionsImportDuplicatesModalDuplicates={transactionsImportDuplicatesModalDuplicates} isTransactionsImportDuplicatesModalOpen={isTransactionsImportDuplicatesModalOpen} onTransactionsImportDuplicatesModalClose={closeTransactionsImportDuplicatesModal} onTransactionsImportDuplicatesModalSubmit={onTransactionsImportDuplicatesModalSubmit} onTransactionsImportFormSubmit={onTransactionsImportFormSubmit} onTransactionsImportFormFileInputChange={onTransactionsImportFormFileInputChange} onTransactionDetailModalSubmit={onTransactionDetailModalSubmit} onTransactionDeleteModalSubmit={onTransactionDeleteModalSubmit} transactionsImportConfirmedModalTransactions={transactionsImportConfirmedModalTransactions} isTransactionsImportConfirmedModalOpen={isTransactionsImportConfirmedModalOpen} closeTransactionsImportConfirmedModal={closeTransactionsImportConfirmedModal} onTransactionsImportConfirmedModalSubmit={onTransactionsImportConfirmedModalSubmit} onNewBudgetModalSubmit={onNewBudgetModalSubmit} onBudgetCycleChange={onBudgetCycleChange} setFooterNavbar={setFooterNavbar} transactionCategories={transactionCategories} transactionTypes={transactionTypes} onNewTransactionModalSubmit={onNewTransactionModalSubmit} />
          </Route>
          <Route path="/settings" exact>
            <SettingsView setFooterNavbar={setFooterNavbar} settings={settings} onSubmit={onSettingsViewSubmit}/>
          </Route>
        </Switch>
        <FooterNavbar active={footerNavbar} />
      </>
    );
  };

  return (
    <div className="App">
      <Router basename={(process.env.NODE_ENV === "production" ? process.env.PUBLIC_URL : null)}>
        {renderApplicationUI()}
        <AlertsContainer alerts={alerts} />
      </Router>
    </div>
  )
};

export default App;

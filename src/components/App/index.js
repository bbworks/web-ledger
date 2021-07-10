import {useState, useEffect} from 'react';
import {BrowserRouter as Router, Switch, Route, Link} from 'react-router-dom';

import {isFalsy, nullCoalesce, convertNumberToCurrency, convertCSVToJSON, getMonthFromNumber, getCurrentYear, getBillingCycleFromDate, areObjectsEqual, typeCheckTransactions, categorizeTransactionByDescription, saveTransactions, importTransactions, fetchTransactionsData} from './../../utilities';

import DashboardView from './../DashboardView';
import BudgetsView from './../BudgetsView';
import TransactionsView from './../TransactionsView';
import SettingsView from './../SettingsView';
import FooterNavbar from './../FooterNavbar';

import './main.css';
import './index.scss';

const App = () => {
/*
localStorage.setItem("account-data", JSON.stringify({
  creditScore: 771,
}));
localStorage.setItem("accounts-data", JSON.stringify([
  {
    name: "Checking *7740",
    balance: "8587.26",
  },
  {
    name: "BILLING *9416",
    balance: "1282.95",
  },
  {
    name: "SAVINGS *0844",
    balance: "12846.97",
  },
  {
    name: "CONTINGNCY *8627",
    balance: "10000.13",
  },
]));
localStorage.setItem("budgets-data", JSON.stringify([
	{
		name: "Primary payroll",
		amount: 4357.28,
		type: "income",
	},
	{
		name: "Other income",
		amount: 0.00,
		type: "income",
	},
	{
		name: "Sharonview mortgage & escrow",
		amount: -1153.04,
		type: "bill",
	  dueDate: "15th"
	},
	{
		name: "HOA dues",
		amount: -37.50,
		type: "bill",
	  dueDate: "15th"
	},
	{
		name: "Duke Energy",
		amount: -145.00,
		type: "bill",
	  dueDate: "3rd"
	},
	{
		name: "SJWD Water District",
		amount: -35.00,
		type: "bill",
	  dueDate: "16th"
	},
	{
		name: "Piedmont Natural Gas",
		amount: -30.00,
		type: "bill",
	  dueDate: "26th"
	},
	{
		name: "Kirby Sanitation",
		amount: -19.00,
		type: "bill",
	  dueDate: "1st"
	},
	{
		name: "State Farm auto insurance",
		amount: -145.00,
		type: "bill",
	  dueDate: "17th"
	},
	{
		name: "Laurens Electric ProTec Security",
		amount: -29.95,
		type: "bill",
	  dueDate: "14th"
	},
	{
		name: "SimpliSafe (for mom)",
		amount: -24.99,
		type: "bill",
	  dueDate: "12th"
	},
	{
		name: "AT&T Internet",
		amount: -50.70,
		type: "bill",
	  dueDate: "11th"
	},
	{
		name: "AT&T phone bill",
		amount: -65.00,
		type: "bill",
	  dueDate: "15th"
	},
	{
		name: "Spotify Premium subscription",
		amount: -10.69,
		type: "bill",
	  dueDate: "23rd"
	},
	{
		name: "Netflix Premium subscription",
		amount: -19.25,
		type: "bill",
	  dueDate: "14th"
	},
	{
		name: "Discovery Plus subscription",
		amount: -7.48,
		type: "bill",
	  dueDate: "17th"
	},
	{
		name: "YMCA membership",
		amount: -84.00,
		type: "bill",
	  dueDate: "9th"
	},
	{
		name: "Savings",
		amount: -1100.00,
		type: "savings",
	},
	{
		name: "Gas",
		amount: -150.00,
		type: "expense",
	},
	{
		name: "Church",
		amount: -440.00,
		type: "expense",
	},
	{
		name: "Groceries/Necessities",
		amount: -400.00,
		type: "expense",
	},
	{
		name: "LoveInAction",
		amount: 0,
		type: "expense",
	},
	{
		name: "Family Outings",
		amount: -250.00,
		type: "expense",
	},
	{
		name: "Personal Spending",
		amount: -50.00,
		type: "expense",
	},
	{
		name: "Miscellaneous",
		amount: 0,
		type: "expense",
	}, //Surplus
]));
*/

  //Set application state
  const initialBudgetsData = JSON.parse(localStorage.getItem("budgets-data"));
  const initialAccountsData = JSON.parse(localStorage.getItem("accounts-data"));
  const initialAccountData = JSON.parse(localStorage.getItem("account-data"));

  const [transactionsData, setTransactionsData] = useState(fetchTransactionsData());
  const [transactions, setTransactions] = useState([]);
  const [budgetsData, setBudgetsData] = useState(initialBudgetsData || null);
  const [accountsData, setAccountsData] = useState(initialAccountsData || null);
  const [accountData, setAccountData] = useState(initialAccountData || null);
  const [footerNavbar, setFooterNavbar] = useState(null);
  const [budgetCycle, setBudgetCycle] = useState(getBillingCycleFromDate(new Date()));
  const [transactionsImportDuplicatesModalNewTransactions, setTransactionsImportDuplicatesModalNewTransactions] = useState([]);
  const [transactionsImportDuplicatesModalDuplicates, setTransactionsImportDuplicatesModalDuplicates] = useState([]);
  const [isTransactionsImportDuplicatesModalOpen, setIsTransactionsImportDuplicatesModalOpen] = useState(false);

  //Every time there is new transactions data,
  // transform it into transactions
  useEffect(
    ()=>{
      console.log("Updating transactions data: ", transactionsData);
      if (isFalsy(transactionsData)) return;

      setTransactionsHandler(typeCheckTransactions(transactionsData));
    }
    , [transactionsData]
  );

  //Whenever the transactions are updated, save them off as well
  useEffect(()=>{
    //Save transactions to localStorage
    saveTransactions(transactions);
  }, [transactions]);

  //Log transactions
  useEffect(()=>console.log("Transactions: ", transactions), [transactions]);

  //Create state handlers
  const setTransactionsHandler = newTransactions=>{
    setTransactions(previousTransactions=>{
      //If there are no previous transactions to append to, short-circuit
      if (!previousTransactions.length) return newTransactions;

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

      //Ask user to confirm true duplicates
      console.log("Duplicates: ", duplicates);
      setTransactionsImportDuplicatesModalNewTransactions(newTransactions);
      setTransactionsImportDuplicatesModalDuplicates(duplicates);
      openTransactionsImportDuplicatesModal();

      //Return the previous transactions
      return previousTransactions;
    });
  };

  const setTransactionsDataFromImportHandler = transactionsData=>{
    //Type check transactions data to convert from strings to the correct type
    const typeCheckedTransactionsData = typeCheckTransactions(transactionsData);

    //Assign category & notes from description
    const categorizedTransactionsData = typeCheckedTransactionsData.map(transactionsData=>categorizeTransactionByDescription(transactionsData));

    //Update the transactions data
    setTransactionsData(categorizedTransactionsData);
  };

  //Create event listeners
  const onTransactionsImportFormSubmit = scrapedTransactionsData=>{
    //Import the scraped transactions data
    const transactionsData = importTransactions(scrapedTransactionsData, "scraped");

    //Set the new transactions data
    setTransactionsDataFromImportHandler(transactionsData);
  };

  const onTransactionsImportFormFileInputChange = transactionsDataArray=>{
    setTransactionsDataFromImportHandler(importTransactions(transactionsDataArray, "csv"));
  };

  const onTransactionDetailModalSubmit = (oldTransaction, updatedTransaction)=>{
    //Update transactions with the new transaction
    const updatedTransactions = [...transactions]; //create deep copy
    updatedTransactions.splice(transactions.indexOf(oldTransaction), 1, updatedTransaction);

    setTransactionsDataFromImportHandler(updatedTransactions);
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

  return (
    <div className="App">
      <Router>
        <Switch>
          <Route path={["/dashboard", "/"]} exact>
            <DashboardView transactions={transactions} accountsData={accountsData} accountData={accountData} budgetsData={budgetsData} budgetCycle={budgetCycle} setFooterNavbar={setFooterNavbar} />
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

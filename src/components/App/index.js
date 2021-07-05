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
		isSinglePaymentBill: false,
	},
	{
		name: "Other income",
		amount: 0.00,
		isSinglePaymentBill: false,
	},
	{
		name: "Sharonview mortgage & escrow",
		amount: -1153.04,
		isSinglePaymentBill: true,
	},
	{
		name: "HOA dues",
		amount: -37.50,
		isSinglePaymentBill: true,
	},
	{
		name: "Duke Energy",
		amount: -145.00,
		isSinglePaymentBill: true,
	},
	{
		name: "SJWD Water District",
		amount: -35.00,
		isSinglePaymentBill: true,
	},
	{
		name: "Piedmont Natural Gas",
		amount: -30.00,
		isSinglePaymentBill: true,
	},
	{
		name: "Kirby Sanitation",
		amount: -19.00,
		isSinglePaymentBill: true,
	},
	{
		name: "State Farm auto insurance",
		amount: -145.00,
		isSinglePaymentBill: true,
	},
	{
		name: "Laurens Electric ProTec Security",
		amount: -29.95,
		isSinglePaymentBill: true,
	},
	{
		name: "SimpliSafe (for mom)",
		amount: -24.99,
		isSinglePaymentBill: true,
	},
	{
		name: "AT&T Internet",
		amount: -50.70,
		isSinglePaymentBill: true,
	},
	{
		name: "AT&T phone bill",
		amount: -65.00,
		isSinglePaymentBill: true,
	},
	{
		name: "Spotify Premium subscription",
		amount: -10.69,
		isSinglePaymentBill: true,
	},
	{
		name: "Netflix Premium subscription",
		amount: -19.25,
		isSinglePaymentBill: true,
	},
	{
		name: "Discovery Plus subscription",
		amount: -7.48,
		isSinglePaymentBill: true,
	},
	{
		name: "YMCA membership",
		amount: -84.00,
		isSinglePaymentBill: true,
	},
	{
		name: "Savings",
		amount: -1100.00,
		isSinglePaymentBill: false,
	},
	{
		name: "Gas",
		amount: -150.00,
		isSinglePaymentBill: false,
	},
	{
		name: "Church",
		amount: -440.00,
		isSinglePaymentBill: false,
	},
	{
		name: "Groceries/Necessities",
		amount: -400.00,
		isSinglePaymentBill: false,
	},
	{
		name: "LoveInAction",
		amount: 0,
		isSinglePaymentBill: false,
	},
	{
		name: "Family Outings",
		amount: -250.00,
		isSinglePaymentBill: false,
	},
	{
		name: "Personal Spending",
		amount: -50.00,
		isSinglePaymentBill: false,
	},
	{
		name: "Miscellaneous",
		amount: 0,
		isSinglePaymentBill: false,
	}, //Surplus
]));
*/

  const initialBudgetsData = JSON.parse(localStorage.getItem("budgets-data"));
  const initialAccountsData = JSON.parse(localStorage.getItem("accounts-data"));
  const initialAccountData = JSON.parse(localStorage.getItem("account-data"));

  const [transactionData, setTransactionData] = useState();
  const [transactions, setTransactions] = useState(fetchTransactionData());
  const [budgetsData, setBudgetsData] = useState(initialBudgetsData || null);
  const [accountsData, setAccountsData] = useState(initialAccountsData || null);
  const [accountData, setAccountData] = useState(initialAccountData || null);

  useEffect(
    ()=>{
      console.log("Updating transaction data: ", transactionData);
      if (isFalsy(transactionData)) return;
      setTransactions(updateTransactions(transactionData));
    }
    , [transactionData]
  );

  useEffect(()=>console.log("Transactions: ", transactions), [transactions]);

  const getMonthFromNumber = number=>{
    switch (number) {
      case 0:
        return "January";
        break;
      case 1:
        return "February";
        break;
      case 2:
        return "March";
        break;
      case 3:
        return "April";
        break;
      case 4:
        return "May";
        break;
      case 5:
        return "June";
        break;
      case 6:
        return "July";
        break;
      case 7:
        return "August";
        break;
      case 8:
        return "September";
        break;
      case 9:
        return "October";
        break;
      case 10:
        return "November";
        break;
      case 11:
        return "December";
        break;
    }
    return null;
  };

  const getCurrentYear = (date)=>{
    return date.getFullYear();
  };

  const getBillingCycleFromDate = date=>{
    return `${getMonthFromNumber(date.getMonth())} ${getCurrentYear(date)}`;
  };

  const [budgetCycle, setBudgetCycle] = useState(getBillingCycleFromDate(new Date()));

  console.log(budgetCycle);
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
            <DashboardView transactions={transactions} accountsData={accountsData} accountData={accountData} budgetCycle={budgetCycle}/>
          </Route>
          <Route path="/budgets" exact>
            <BudgetsView transactions={transactions} budgetsData={budgetsData}/>
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

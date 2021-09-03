import {useState, useEffect} from 'react';

import TransactionDataSearchForm from './../TransactionDataSearchForm';
import TransactionRowDateSeparator from './../TransactionRowDateSeparator';
import TransactionRow from './../TransactionRow';

import {convertNumberToCurrency, getTransactionsAmountTotal} from './../../utilities';

import './index.scss';

const TransactionsDataRows = ({ filteredBudgetCycleTransactions, heading, searchFilters, onTransactionEditButtonClick, onTransactionDeleteButtonClick })=>{
  //Temporary variable used to render date headings
  let currentDateRendered;

  return (
    <div className="transaction-rows">
      {searchFilters.length ? null : (
        <div className="transaction-rows-heading-container d-flex justify-content-between align-items-end mb-2">
          <h2 className="transaction-rows-heading mb-0">{heading}</h2>
          <div className="fw-bold">
            <span className="transaction-rows-heading-count">{convertNumberToCurrency(getTransactionsAmountTotal(filteredBudgetCycleTransactions))}</span>
            &nbsp;
            <span className="transaction-rows-heading-count me-3">({filteredBudgetCycleTransactions.length})</span>
          </div>
        </div>
      )}
      {filteredBudgetCycleTransactions
      //Sort remaining transactions
      .sort((a,b)=>b.TransactionDate-a.TransactionDate)
      //Add in the date separators
      .reduce((transactions, transaction)=>{
        if ((currentDateRendered ? currentDateRendered.Date.toJSON() : false) !== transaction.TransactionDate.toJSON()) {
          const dateHeaderObject = {
            Date: transaction.TransactionDate,
            Count: 1,
          };
          transactions.push(dateHeaderObject);
          currentDateRendered = dateHeaderObject;
        }
        else {
          currentDateRendered.Count++;
        }
        return transactions.concat(transaction);
      }, [])
      .map((transaction, i)=>(
        transaction.Date && transaction.Count ?
        <TransactionRowDateSeparator key={i} date={transaction.Date} count={transaction.Count} /> :
        <TransactionRow key={i} transaction={transaction} onTransactionEditButtonClick={onTransactionEditButtonClick} onTransactionDeleteButtonClick={onTransactionDeleteButtonClick} />
      ))}
    </div>
  );
};

const TransactionsData = ({ budgetCycleTransactions, onTransactionEditButtonClick, onTransactionDeleteButtonClick })=>{
  const filterTransactionsBySearchFilters = (budgetCycleTransactions, searchFilters)=>{
    //Filter transactions (or render them all) based on current search filters
    const newlyFilteredBudgetCycleTransactions = {
      ...budgetCycleTransactions,
      income: budgetCycleTransactions.income.filter(t=>searchFilters.map(a=>(t.DescriptionDisplay || t.Description).match(new RegExp(a, "i"))).every(i=>i)),
      expenses: budgetCycleTransactions.expenses.filter(t=>searchFilters.map(a=>(t.DescriptionDisplay || t.Description).match(new RegExp(a, "i"))).every(i=>i)),
    };
    Object.defineProperty(newlyFilteredBudgetCycleTransactions, "all", Object.getOwnPropertyDescriptor(budgetCycleTransactions, "all"));
    return newlyFilteredBudgetCycleTransactions;
  };

  const [searchFilters, setSearchFilters] = useState([]);
  const [filteredBudgetCycleTransactions, setFilteredBudgetCycleTransactions] = useState(filterTransactionsBySearchFilters(budgetCycleTransactions, searchFilters));

  const filteredIncomeTotal = convertNumberToCurrency(filteredBudgetCycleTransactions.income.reduce((total, t)=>total+=t.Amount, 0))
  const filteredExpensesTotal = convertNumberToCurrency(filteredBudgetCycleTransactions.expenses.reduce((total, t)=>total+=t.Amount, 0))
  const filteredRemainingTotal = convertNumberToCurrency(filteredBudgetCycleTransactions.all.reduce((total, t)=>total+=t.Amount, 0))

  const onTransactionDataSearchFormSubmit = search=>{
    setSearchFilters(previousSearchFilters=>[...previousSearchFilters, search]);
  };

  const onFilterClick = removedSearchFilter=>{
    setSearchFilters(previousSearchFilters=>{
      const newSearchFilters = [...previousSearchFilters];
      return newSearchFilters.splice(newSearchFilters.indexOf(removedSearchFilter),1) && newSearchFilters;
    });
  };

  //Keep filtered transactions updated
  useEffect(()=>
    setFilteredBudgetCycleTransactions(filterTransactionsBySearchFilters(budgetCycleTransactions, searchFilters))
  , [budgetCycleTransactions, searchFilters]);

  useEffect(()=>console.log(filteredBudgetCycleTransactions), [filteredBudgetCycleTransactions]);

  return (
    <div className="transactions-data">
      <TransactionDataSearchForm searchFilters={searchFilters} onSubmit={onTransactionDataSearchFormSubmit} onFilterClick={onFilterClick} />
      {
        searchFilters.length ?
        <TransactionsDataRows filteredBudgetCycleTransactions={filteredBudgetCycleTransactions.all} searchFilters={searchFilters} onTransactionEditButtonClick={onTransactionEditButtonClick} onTransactionDeleteButtonClick={onTransactionDeleteButtonClick}/> :
        <>
          <TransactionsDataRows filteredBudgetCycleTransactions={filteredBudgetCycleTransactions.income} heading="Income" searchFilters={searchFilters} onTransactionEditButtonClick={onTransactionEditButtonClick} onTransactionDeleteButtonClick={onTransactionDeleteButtonClick}/>
          <TransactionsDataRows filteredBudgetCycleTransactions={filteredBudgetCycleTransactions.expenses} heading="Expenses" searchFilters={searchFilters} onTransactionEditButtonClick={onTransactionEditButtonClick} onTransactionDeleteButtonClick={onTransactionDeleteButtonClick}/>
        </>
      }
      <div className="transactions-information d-flex justify-content-between mb-4 mr-2">
        <span className="transactions-count">{(filteredBudgetCycleTransactions.all.length ? filteredBudgetCycleTransactions.all.length : 0)} transactions</span>
        <div>
          <div className="transactions-total">{filteredRemainingTotal} total</div>
        </div>
      </div>
    </div>
  );
};

export default TransactionsData;

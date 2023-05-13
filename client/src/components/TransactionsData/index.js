import {useState, useEffect} from 'react';

import TransactionsDataSearchForm from './../TransactionsDataSearchForm';
import TransactionRowDateSeparator from './../TransactionRowDateSeparator';
import TransactionRow from './../TransactionRow';

import {convertNumberToCurrencyString, getTransactionsAmountTotal, isMatchedValue, formatTransactionDisplay} from './../../utilities';
import {useConsoleLog} from './../../hooks';

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
            <span className="transaction-rows-heading-count">{convertNumberToCurrencyString(getTransactionsAmountTotal(filteredBudgetCycleTransactions))}</span>
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
  const defaultTransactionProperty = "DescriptionDisplay";

  const filterTransactionsBySearchFilters = (budgetCycleTransactions, searchFilters)=>{
    const filterBudgetCycleTransactions = budgetCycleTransactions=>{
      return budgetCycleTransactions
        .filter(transaction=>
          searchFilters.map(({key:searchKey, value:searchValue})=>{
            const value = formatTransactionDisplay(transaction)[searchKey ?? defaultTransactionProperty];
            if (!value && !(searchKey === "Category" && searchValue === "Miscellaneous")) return false;

            if (searchKey === "Category" && searchValue === "Miscellaneous") return value === null || value.match(new RegExp(searchValue, "i"));
            return isMatchedValue(value, searchValue);
          })
          .every(i=>i)
        );
    };

    //Filter transactions (or render them all) based on current search filters
    const newlyFilteredBudgetCycleTransactions = {
      ...budgetCycleTransactions,
      income: filterBudgetCycleTransactions(budgetCycleTransactions.income),
      expenses: filterBudgetCycleTransactions(budgetCycleTransactions.expenses),
    };
    Object.defineProperty(newlyFilteredBudgetCycleTransactions, "all", Object.getOwnPropertyDescriptor(budgetCycleTransactions, "all"));
    return newlyFilteredBudgetCycleTransactions;
  };

  const [searchFilters, setSearchFilters] = useState([]);
  const [filteredBudgetCycleTransactions, setFilteredBudgetCycleTransactions] = useState(filterTransactionsBySearchFilters(budgetCycleTransactions, searchFilters));

  const filteredRemainingTotal = convertNumberToCurrencyString(getTransactionsAmountTotal(filteredBudgetCycleTransactions.all));
  const transactionProperties = (filteredBudgetCycleTransactions.all?.length ? Object.keys(filteredBudgetCycleTransactions.all[0]).filter(property=>!["DateCreated","DateModified","IsAutoCategorized","IsUpdatedByUser"].includes(property)) : []);

  const onTransactionsDataSearchFormSubmit = searchObject=>{
    setSearchFilters(previousSearchFilters=>[...previousSearchFilters, searchObject]);
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

  useConsoleLog(filteredBudgetCycleTransactions, "filteredBudgetCycleTransactions");

  return (
    <div className="transactions-data">
      <TransactionsDataSearchForm budgetCycleTransactions={budgetCycleTransactions} transactionProperties={transactionProperties} searchFilters={searchFilters} onSubmit={onTransactionsDataSearchFormSubmit} onFilterClick={onFilterClick} />
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

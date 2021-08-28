import {useState, useEffect} from 'react';

import TransactionDataSearchForm from './../TransactionDataSearchForm';
import TransactionRowDateSeparator from './../TransactionRowDateSeparator';
import TransactionRow from './../TransactionRow';

import {convertNumberToCurrency} from './../../utilities';

import './index.scss';

const TransactionsData = ({ budgetCycleTransactions, onTransactionEditButtonClick, onTransactionDeleteButtonClick })=>{
  const filterTransactionsBySearchFilters = (transactions, searchFilters)=>{
    //Filter transactions (or render them all) based on current search filters
    return transactions.filter(t=>searchFilters.map(a=>(t.DescriptionDisplay || t.Description).match(new RegExp(a, "i"))).every(i=>i))
  };

  const [searchFilters, setSearchFilters] = useState([]);
  const [filteredTransactions, setFilteredTransactions] = useState(filterTransactionsBySearchFilters(budgetCycleTransactions.all, searchFilters));

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
    setFilteredTransactions(filterTransactionsBySearchFilters(budgetCycleTransactions.all, searchFilters))
  , [budgetCycleTransactions, searchFilters]);

  //Temporary variable used to render date headings
  let currentDateRendered;

  return (
    <div className="transactions-data">
      <TransactionDataSearchForm searchFilters={searchFilters} onSubmit={onTransactionDataSearchFormSubmit} onFilterClick={onFilterClick} />
      {filteredTransactions
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
      <div className="transactions-information d-flex justify-content-between mb-4 mr-2">
        <span className="transactions-count">{(filteredTransactions.length ? filteredTransactions.length : 0)} transactions</span>
        <span className="">{convertNumberToCurrency(filteredTransactions.reduce((total, t)=>total+=t.Amount, 0))}</span>
      </div>
    </div>
  );
};

export default TransactionsData;

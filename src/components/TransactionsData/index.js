import {useState, useEffect} from 'react';

import TransactionDataSearchForm from './../TransactionDataSearchForm';
import TransactionRowDateSeparator from './../TransactionRowDateSeparator';
import TransactionRow from './../TransactionRow';

import './index.scss';

const TransactionsData = ({ transactions, onTransactionEditButtonClick, onTransactionDeleteButtonClick })=>{
  const [searchFilters, setSearchFilters] = useState([]);

  const onTransactionDataSearchFormSubmit = search=>{
    setSearchFilters(previousSearchFilters=>[...previousSearchFilters, search]);
  };

  const onFilterClick = removedSearchFilter=>{
    setSearchFilters(previousSearchFilters=>{
      const newSearchFilters = [...previousSearchFilters];
      return newSearchFilters.splice(newSearchFilters.indexOf(removedSearchFilter),1) && newSearchFilters;
    });
  };

  //Temporary variable used to render date headings
  let currentDateRendered;

  return (
    <div className="transaction-data">
      <TransactionDataSearchForm searchFilters={searchFilters} onSubmit={onTransactionDataSearchFormSubmit} onFilterClick={onFilterClick} />
      {transactions
      //Filter transactions (or render them all) based on current search filters
      .filter(t=>searchFilters.map(a=>(t.DescriptionDisplay || t.Description).match(new RegExp(a, "i"))).every(i=>i))
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
        <TransactionRowDateSeparator date={transaction.Date} count={transaction.Count} /> :
        <TransactionRow key={i} transaction={transaction} onTransactionEditButtonClick={onTransactionEditButtonClick} onTransactionDeleteButtonClick={onTransactionDeleteButtonClick} />
      ))}
      <div className="transaction-count text-end mb-4 mr-2">
        <small><em>{(transactions && transactions.length ? transactions.length : 0)} transactions</em></small>
      </div>
    </div>
  );
};

export default TransactionsData;

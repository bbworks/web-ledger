import TransactionRow from './../TransactionRow';
import TransactionRowDateSeparator from './../TransactionRowDateSeparator';

import './index.scss';

const TransactionsData = ({ transactions, onTransactionEditButtonClick, onTransactionDeleteButtonClick })=>{
  let currentDateRendered;

  return (
    <div className="transaction-data">
      {transactions
      .sort((a,b)=>b.TransactionDate-a.TransactionDate)
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

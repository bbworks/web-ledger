import TransactionRow from './../TransactionRow';

import './index.scss';

const TransactionsData = ({ transactions, onTransactionEditButtonClick, onTransactionDeleteButtonClick })=>{
  return (
    <div className="transaction-data">
      {transactions.map((transaction, i)=>(
        <TransactionRow key={i} transaction={transaction} onTransactionEditButtonClick={onTransactionEditButtonClick} onTransactionDeleteButtonClick={onTransactionDeleteButtonClick} />
      ))}
      <div className="transaction-count text-end mb-4 mr-2">
        <small><em>{(transactions && transactions.length ? transactions.length : 0)} transactions</em></small>
      </div>
    </div>
  );
};

export default TransactionsData;

import TransactionsTable from './../TransactionsTable';
import './index.scss';

const TransactionsData = ({ transactions, onTransactionEditButtonClick, onTransactionDeleteButtonClick })=>{
  return (
    <div className="transaction-data">
      <h2 className="h2">Transactions</h2>
      <TransactionsTable transactions={transactions} onTransactionEditButtonClick={onTransactionEditButtonClick} onTransactionDeleteButtonClick={onTransactionDeleteButtonClick} />
      <div className="transaction-count text-end mb-4 mr-2">
        <small><em>{(transactions && transactions.length ? transactions.length : 0)} transactions</em></small>
      </div>
    </div>
  );
};

export default TransactionsData;

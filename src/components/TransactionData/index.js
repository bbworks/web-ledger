import TransactionTable from './../TransactionTable';
import './index.scss';

const TransactionData = ({ transactions, onTransactionEditButtonClick })=>{
  return (
    <div className="transaction-data">
      <h2 className="h2">Transactions</h2>
      <TransactionTable transactions={transactions} onTransactionEditButtonClick={onTransactionEditButtonClick} />
      <div className="transaction-count text-end mb-4 mr-2">
        <small><em>{transactions.length} transactions</em></small>
      </div>
    </div>
  );
};

export default TransactionData;

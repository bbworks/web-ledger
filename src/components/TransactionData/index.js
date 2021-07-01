import TransactionTable from './../TransactionTable';
import './index.scss';

const TransactionData = ({ transactions, transactionButtonOnClick })=>{
  return (
    <div className="transaction-data">
      <h2 className="h2">Transactions</h2>
      <div className="transaction-table-container">
        <TransactionTable transactions={transactions} transactionButtonOnClick={transactionButtonOnClick} />
      </div>
      <div className="transaction-count text-end mb-4 mr-2">
        <small><em>{transactions.length} transactions</em></small>
      </div>
    </div>
  );
};

export default TransactionData;

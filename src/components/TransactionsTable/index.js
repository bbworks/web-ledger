import TransactionsTableHeaders from './../TransactionsTableHeaders';
import TransactionsTableBody from './../TransactionsTableBody';
import './index.scss';

const TransactionsTable = ({ transactions, onTransactionEditButtonClick })=>{
  if (!transactions.length) return null;
  return (
    <div className="transaction-table-container">
      <table className="table table-striped table-hover mb-0">
        <TransactionsTableHeaders />
        <TransactionsTableBody transactions={transactions} onTransactionEditButtonClick={onTransactionEditButtonClick} />
      </table>
    </div>
  );
};

export default TransactionsTable;

import TransactionTableHeaders from './../TransactionTableHeaders';
import TransactionTableBody from './../TransactionTableBody';
import './index.scss';

const TransactionTable = ({ transactions, transactionButtonOnClick })=>{
  return (
    <div className="transaction-table-container">
      <table className="table table-striped table-hover mb-0">
        <TransactionTableHeaders />
        <TransactionTableBody transactions={transactions} transactionButtonOnClick={transactionButtonOnClick} />
      </table>
    </div>
  );
};

export default TransactionTable;

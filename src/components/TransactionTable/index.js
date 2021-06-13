import TransactionTableHeaders from './../TransactionTableHeaders';
import TransactionTableBody from './../TransactionTableBody';
import './index.css';

const TransactionTable = ({ transactions, transactionButtonOnClick })=>{
  return (
    <table className="table table-striped table-hover mb-0">
      <TransactionTableHeaders />
      <TransactionTableBody transactions={transactions} transactionButtonOnClick={transactionButtonOnClick} />
    </table>
  );
};

export default TransactionTable;

import TransactionTableTransaction from './../TransactionTableTransaction';
import './index.css';

const TransactionTableTransactions = ({ transactions, transactionButtonOnClick })=>{
  return (
    <>
      {transactions.map((transaction, i)=><TransactionTableTransaction key={i} transaction={transaction} transactionButtonOnClick={transactionButtonOnClick} />)}
    </>
  );
};

export default TransactionTableTransactions;

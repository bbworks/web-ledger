import TransactionTableTransaction from './../TransactionTableTransaction';
import './index.scss';

const TransactionTableTransactions = ({ transactions, transactionButtonOnClick })=>{
  return (
    <>
      {transactions.map((transaction, i)=><TransactionTableTransaction key={i} transaction={transaction} transactionButtonOnClick={transactionButtonOnClick} />)}
    </>
  );
};

export default TransactionTableTransactions;

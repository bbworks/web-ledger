import TransactionTableTransaction from './../TransactionTableTransaction';
import './index.scss';

const TransactionTableTransactions = ({ transactions, onTransactionEditButtonClick })=>{
  return (
    <>
      {transactions.map((transaction, i)=><TransactionTableTransaction key={i} transaction={transaction} onTransactionEditButtonClick={onTransactionEditButtonClick} />)}
    </>
  );
};

export default TransactionTableTransactions;

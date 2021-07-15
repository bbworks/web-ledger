import TransactionsTableTransaction from './../TransactionsTableTransaction';
import './index.scss';

const TransactionsTableTransactions = ({ transactions, onTransactionEditButtonClick })=>{
  if(!(transactions && transactions.length)) return null;
  return (
    <>
      {transactions.map((transaction, i)=><TransactionsTableTransaction key={i} transaction={transaction} onTransactionEditButtonClick={onTransactionEditButtonClick} />)}
    </>
  );
};

export default TransactionsTableTransactions;

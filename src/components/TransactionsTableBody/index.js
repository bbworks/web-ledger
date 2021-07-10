import {useState, useEffect} from 'react';
import TransactionsTableTransactions from './../TransactionsTableTransactions';
import {convertNumberToCurrency} from './../../utilities';
import './index.scss';

const TransactionsTableBody = ({ transactions, onTransactionEditButtonClick })=>{
  const calculateTotalAmount = ()=>{
    return Number(transactions.reduce((accumulator, transaction)=>accumulator += (transaction.Type == "Charges" ? transaction.Amount : 0), 0).toFixed(2));
  };

  const [totalAmount, setTotalAmount] = useState(0);

  useEffect(()=>setTotalAmount(calculateTotalAmount()), [transactions]);

  return (
    <tbody>
      <TransactionsTableTransactions transactions={transactions} onTransactionEditButtonClick={onTransactionEditButtonClick} />
      <tr className="total">
        <td></td>
        <td></td>
        <td></td>
        <td></td>
        <td></td>
        <td></td>
        <td>{convertNumberToCurrency(totalAmount)}</td>
        <td></td>
        <td></td>
      </tr>
    </tbody>
  );
};

export default TransactionsTableBody;

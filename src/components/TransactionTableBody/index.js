import {useState, useEffect} from 'react';
import TransactionTableTransactions from './../TransactionTableTransactions';
import {convertNumberToCurrency} from './../../utilities';
import './index.scss';

const TransactionTableBody = ({ transactions, onTransactionEditButtonClick })=>{
  const calculateTotalAmount = ()=>{
    return Number(transactions.reduce((accumulator, transaction)=>accumulator += (transaction.Type == "Charges" ? transaction.Amount : 0), 0).toFixed(2));
  };

  const [totalAmount, setTotalAmount] = useState(0);

  useEffect(()=>setTotalAmount(calculateTotalAmount()), [transactions]);

  return (
    <tbody>
      <TransactionTableTransactions transactions={transactions} onTransactionEditButtonClick={onTransactionEditButtonClick} />
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

export default TransactionTableBody;

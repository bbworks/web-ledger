import {useState, useEffect} from 'react';
import TransactionsTableTransactions from './../TransactionsTableTransactions';
import {convertNumberToCurrency, getSumByProp} from './../../utilities';
import './index.scss';

const TransactionsTableBody = ({ transactions, onTransactionEditButtonClick })=>{
  const calculatePaymentAmountTotal = ()=>{
    return convertNumberToCurrency(
      getSumByProp(
        transactions.filter(transaction=>transaction.Type !== "Payments")
        , "Amount"
      )
    )
  };

  const [totalAmount, setTotalAmount] = useState("");

  useEffect(()=>{
    if (!transactions.length) return;
    setTotalAmount(calculatePaymentAmountTotal());
  }, [transactions]);

  return (
    <tbody>
      <TransactionsTableTransactions transactions={transactions} onTransactionEditButtonClick={onTransactionEditButtonClick} />
      <tr className="total">
        <td></td>
        <td></td>
        <td></td>
        <td></td>
        <td></td>
        <td>{(totalAmount ? totalAmount : "")}</td>
        <td></td>
        <td></td>
      </tr>
    </tbody>
  );
};

export default TransactionsTableBody;

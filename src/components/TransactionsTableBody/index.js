import {useState, useEffect} from 'react';

import TransactionsTableTransaction from './../TransactionsTableTransaction';

import {convertNumberToCurrency, getSumByProp} from './../../utilities';

import './index.scss';

const TransactionsTableBody = ({ transactions, onTransactionEditButtonClick, onTransactionDeleteButtonClick })=>{
  const calculatePaymentAmountTotal = ()=>{
    return convertNumberToCurrency(
      getSumByProp(
        transactions.filter(transaction=>!["Payments","Credit"].includes(transaction.Type))
        , "Amount"
      )
    )
  };

  const [totalAmount, setTotalAmount] = useState("");

  useEffect(()=>{
    if (!transactions.length) return;
    setTotalAmount(calculatePaymentAmountTotal());
  }, [transactions]);

  if(!transactions.length) return null;

  return (
    <tbody>
      {transactions.map((transaction, i)=><TransactionsTableTransaction key={i} transaction={transaction} onTransactionEditButtonClick={onTransactionEditButtonClick} onTransactionDeleteButtonClick={onTransactionDeleteButtonClick} />)}
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

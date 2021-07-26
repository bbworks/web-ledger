import {useState, useEffect} from 'react';

import TagBadge from './../TagBadge';

import {nullCoalesce, formatTransactionDisplay} from './../../utilities';

import './index.scss';

const TransactionsTableTransaction = ({ transaction, onTransactionEditButtonClick })=>{
  const [transactionDisplay, setTransactionDisplay] = useState({
    PostedDate: "",
    TransactionDate: "",
    AccountNumber: "",
    Type: "",
    Description: "",
    Amount: "",
    Category: "",
    Notes: "",
    Tags: [],
  });

  useEffect(()=>setTransactionDisplay(formatTransactionDisplay(transaction)), [transaction]);

  return (
    <tr className="transaction">
      <td>{transactionDisplay.TransactionDate}</td>
      <td>{transactionDisplay.AccountNumber}</td>
      <td>{transactionDisplay.Category}</td>
      <td>{transactionDisplay.Description}</td>
      <td>{transactionDisplay.Notes}</td>
      <td>{transactionDisplay.Amount}</td>
      <td>{transactionDisplay.Tags.map(tag=><TagBadge key={tag} tag={tag} />)}</td>
      <td><button className="transaction-edit-button btn" type="button" onClick={()=>onTransactionEditButtonClick(transaction)}><i className="transaction-edit-button-icon fas fa-edit"></i></button></td>
    </tr>
  );
};

export default TransactionsTableTransaction;

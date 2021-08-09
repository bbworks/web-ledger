import {useState, useEffect} from 'react';

import TagBadge from './../TagBadge';

import {nullCoalesce, formatTransactionDisplay} from './../../utilities';

import './index.scss';

const TransactionsTableTransaction = ({ transaction, onTransactionEditButtonClick:onTransactionEditButtonClickProp, onTransactionDeleteButtonClick:onTransactionDeleteButtonClickProp })=>{
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

  const onTransactionEditButtonClick = event=>{
    onTransactionEditButtonClickProp(transaction);
  };

  const onTransactionDeleteButtonClick = event=>{
    onTransactionDeleteButtonClickProp(transaction);
  };

  return (
    <tr className="transaction">
      <td>{transactionDisplay.TransactionDate}</td>
      <td>{transactionDisplay.AccountNumber}</td>
      <td>{transactionDisplay.Category}</td>
      <td>{transactionDisplay.Description}</td>
      <td>{transactionDisplay.Notes}</td>
      <td>{transactionDisplay.Amount}</td>
      <td>{transactionDisplay.Tags.map(tag=><TagBadge key={tag} tag={tag} />)}</td>
      <td style={{whiteSpace: "pre"}}>
        <button className="transaction-edit-button transaction-button btn" type="button" onClick={onTransactionEditButtonClick}>
          <i className="transaction-edit-button-icon fas fa-edit"></i>
        </button>
        <button className="transaction-delete-button transaction-button btn" type="button" onClick={onTransactionDeleteButtonClick}>
          <i className="transaction-edit-button-icon fas fa-trash"></i>
        </button>
      </td>
    </tr>
  );
};

export default TransactionsTableTransaction;

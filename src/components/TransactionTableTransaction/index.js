import {useState, useEffect} from 'react';

import TagBadge from './../TagBadge';
import {nullCoalesce} from './../../utilities.js';
import {formatTransactionDisplay} from './../../transactions.js';
import './index.scss';

const TransactionTableTransaction = ({ transaction, transactionButtonOnClick })=>{
  const [transactionDisplay, setTransactionDisplay] = useState({
    PostedDate: "",
    TransactionDate: "",
    Type: "",
    Category: "",
    Description: "",
    DescriptionDisplay: "",
    Notes: "",
    Amount: "",
    Tags: [],
  });

  useEffect(()=>setTransactionDisplay(formatTransactionDisplay(transaction)), [transaction]);

  return (
    <tr className="transaction">
      <td>{transactionDisplay.PostedDate}</td>
      <td>{transactionDisplay.TransactionDate}</td>
      <td>{transactionDisplay.Type}</td>
      <td>{transactionDisplay.Category}</td>
      <td>{nullCoalesce(transactionDisplay.DescriptionDisplay, transactionDisplay.Description) ? nullCoalesce(transactionDisplay.DescriptionDisplay, transactionDisplay.Description) : ""}</td>
      <td>{transactionDisplay.Notes}</td>
      <td>{transactionDisplay.Amount}</td>
      <td>{transactionDisplay.Tags.map(tag=><TagBadge key={tag} tag={tag} />)}</td>
      <td><button className="transaction-button btn" type="button" onClick={()=>transactionButtonOnClick(transaction)} data-bs-toggle="modal" data-bs-target="#transaction-modal"><i className="transaction-button-icon fas fa-edit"></i></button></td>
    </tr>
  );
};

export default TransactionTableTransaction;

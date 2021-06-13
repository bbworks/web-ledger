import TagBadge from './../TagBadge';
import './index.css';

const TransactionTableTransaction = ({ transaction, transactionButtonOnClick })=>{
  const {display: {PostedDate, TransactionDate, Type, Category, Description, Notes, Amount, Tags}} = transaction;

  return (
    <tr className="transaction">
      <td>{PostedDate ? PostedDate : ""}</td>
      <td>{TransactionDate ? TransactionDate : ""}</td>
      <td>{Type ? Type : ""}</td>
      <td>{Category ? Category : ""}</td>
      <td>{Description ? Description : ""}</td>
      <td>{Notes ? Notes : ""}</td>
      <td>{Amount ? Amount : ""}</td>
      <td>{Tags.map(tag=><TagBadge key={tag} tag={tag} />)}</td>
      <td><button className="transaction-button btn" type="button" onClick={()=>transactionButtonOnClick(transaction)} data-bs-toggle="modal" data-bs-target="#transaction-modal"><i className="transaction-button-icon fas fa-edit"></i></button></td>
    </tr>
  );
};

export default TransactionTableTransaction;

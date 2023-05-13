import Modal from 'react-bootstrap/Modal';

import {convertNumberToCurrencyString} from './../../utilities';

import './index.scss';

const TransactionsImportConfirmedModal = ({ transactions, duplicates, isOpen, onClose, onSubmit:onSubmitProp })=>{
  const onSubmit = event=>{
    event.preventDefault();

    onSubmitProp(transactions);
  };

  const longestTransactionDate = Math.max(...transactions.map(({TransactionDate})=>TransactionDate.toLocaleDateString("en-US", {timeZone: "UTC"}).length));
  const longestAmount = Math.max(...transactions.map(({Amount})=>`${Amount >= 0 ? " " : ""}${convertNumberToCurrencyString(Amount)}`.length));
  const longestDescription = Math.max(...transactions.map(({Description})=>Description.length));

  return (
    <Modal className="transaction-import-confirmed-modal" show={isOpen} onHide={onClose}>
      <Modal.Header>
        <Modal.Title className="modal-title">Transactions imported!</Modal.Title>
        <button className="btn-close" type="button" data-bs-dismiss="modal" onClick={onClose}></button>
      </Modal.Header>
      <form className="transaction-import-confirmed-modal-form" onSubmit={onSubmit}>
        <Modal.Body>
          <p>Successfully imported {transactions.length} transactions.</p>
          <div className="overflow-auto">
            {
              transactions.map((transaction, i)=>{
                const transactionDateString = transaction.TransactionDate.toLocaleDateString("en-US", {timeZone: "UTC"});
                const amountString = `${transaction.Amount >= 0 ? " " : ""}${convertNumberToCurrencyString(transaction.Amount)}`;
                const descriptionString = transaction.Description;

                const transactionDateSpaces = Array(longestTransactionDate-transactionDateString.length).fill(" ").join("");
                const amountSpaces = Array(longestAmount-amountString.length).fill(" ").join("");
                const descriptionSpaces = Array(longestDescription-descriptionString.length).fill(" ").join("");

                return (
                  <div key={i} className="confirmed-transaction">
                    {`${transactionDateString}${transactionDateSpaces}  ${amountString}${amountSpaces}  ${descriptionString}${descriptionSpaces}`}
                  </div>
                );
            })
            }
          </div>
        </Modal.Body>
        <Modal.Footer>
          <button className="btn btn-secondary" type="button" tabIndex="1" onClick={onClose}>Cancel import</button>
          <button className="btn btn-primary" type="submit" tabIndex="2">Finish import</button>
        </Modal.Footer>
      </form>
    </Modal>
  );
};

export default TransactionsImportConfirmedModal;

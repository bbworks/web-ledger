import {useState, useEffect} from 'react';

import Modal from 'react-bootstrap/Modal';

import {convertNumberToCurrency} from './../../utilities';

import './index.scss';

const TransactionsImportConfirmedModal = ({ transactions, duplicates, isOpen, onClose, onSubmit:onSubmitProp })=>{
  const onSubmit = event=>{
    event.preventDefault();

    onSubmitProp(transactions);
  };

  return (
    <Modal id="transaction-confirmed-duplicate-modal" show={isOpen} onHide={onClose}>
      <Modal.Header>
        <Modal.Title className="modal-title">Transactions imported!</Modal.Title>
        <button className="btn-close" type="button" data-bs-dismiss="modal" onClick={onClose}></button>
      </Modal.Header>
      <form className="transaction-confirmed-duplicate-modal-form" onSubmit={onSubmit}>
        <Modal.Body>
          <p>Successfully imported {transactions.length} transactions.</p>
          <div className="overflow-auto">
            {
              transactions.map((transaction, i)=>(
                <div key={i}>
                  {`${(transaction.TransactionDate).toLocaleDateString()} ${convertNumberToCurrency(transaction.Amount)} ${transaction.Description}`}
                </div>
              ))
            }
          </div>
        </Modal.Body>
        <Modal.Footer>
          <button className="btn btn-secondary" type="button" tabIndex="1" onClick={onClose}>Cancel import</button>
          <button className="btn btn-primary" type="submit" tabIndex="2">Save</button>
        </Modal.Footer>
      </form>
    </Modal>
  );
};

export default TransactionsImportConfirmedModal;

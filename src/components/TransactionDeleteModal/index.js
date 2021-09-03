import Modal from 'react-bootstrap/Modal';

import './index.scss';

const TransactionDetailModal = ({ transaction, isOpen, onClose, onSubmit:onSubmitProp })=>{
  const onSubmit = event=>{
    event.preventDefault();

    onSubmitProp(transaction);
  };

  return (
    <Modal id="transaction-modal" show={isOpen} onHide={onClose}>
      <Modal.Header>
        <Modal.Title className="modal-title">Delete Transaction</Modal.Title>
        <button className="btn-close" type="button" onClick={onClose}></button>
      </Modal.Header>
      <form className="transaction-modal-form" onSubmit={onSubmit}>
        <Modal.Body>
          <p class="text-center">Are you sure?</p>
        </Modal.Body>
        <Modal.Footer>
          <button className="btn btn-secondary" type="button" tabIndex="1" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" type="submit" tabIndex="2">Delete</button>
        </Modal.Footer>
      </form>
    </Modal>
  );
};

export default TransactionDetailModal;

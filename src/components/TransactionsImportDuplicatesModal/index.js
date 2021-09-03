import {useState, useEffect} from 'react';

import Modal from 'react-bootstrap/Modal';

import TransactionsImportDuplicatesModalDuplicateCheckbox from './../TransactionsImportDuplicatesModalDuplicateCheckbox';
import {isTransactionDuplicate} from './../../utilities';

import './index.scss';

const TransactionsImportDuplicatesModal = ({ newTransactions, duplicates, isOpen, onClose, onSubmit:onSubmitProp })=>{
  const [duplicatesData, setDuplicatesData] = useState(duplicates.map(duplicate=>({duplicate, confirmed: true})));

  useEffect(()=>{
    if(!duplicatesData.length) return;

    console.log("Duplicates data: ", duplicatesData);
  }, [duplicatesData]);

  const onSubmit = event=>{
    //Prevent the form from submitting
    event.preventDefault();

    //Get the checked duplicates
    const confirmedDuplicates = duplicatesData.filter(duplicateData=>duplicateData.confirmed).map(duplicateData=>duplicateData.duplicate);

    console.log("Duplicates confirmed from TransactionsImportDuplicatesModal", confirmedDuplicates);

    //Remove the true duplicates
    const filteredNewTransactions = newTransactions.filter(newTransaction=>!isTransactionDuplicate(newTransaction, confirmedDuplicates));

    onSubmitProp(filteredNewTransactions);
  };

  const onTransactionsImportDuplicatesModalDuplicateCheckboxChange = (oldDuplicateData, newDuplicateData)=>{
    setDuplicatesData(previousDuplicatesData=>{
      const newDuplicatesData = [...previousDuplicatesData];
      const oldDuplicateDataIndex = previousDuplicatesData.indexOf(oldDuplicateData);
      newDuplicatesData[oldDuplicateDataIndex] = newDuplicateData;
      return newDuplicatesData;
    });
  };

  return (
    <Modal id="transaction-import-duplicate-modal" show={isOpen} onHide={onClose}>
      <Modal.Header>
        <Modal.Title className="modal-title">Duplicate transactions</Modal.Title>
        <button className="btn-close" type="button" data-bs-dismiss="modal" onClick={onClose}></button>
      </Modal.Header>
      <form className="transaction-import-duplicate-form" onSubmit={onSubmit}>
        <Modal.Body>
          <p>{duplicates.length} possible duplicate transactions were found. Please confirm which are duplicates.</p>
          <div className="overflow-auto">
            {
              duplicatesData.map((duplicateData, i)=>(
                <TransactionsImportDuplicatesModalDuplicateCheckbox key={i} id={i} duplicateData={duplicateData} onChange={onTransactionsImportDuplicatesModalDuplicateCheckboxChange} />
              ))
            }
          </div>
        </Modal.Body>
        <Modal.Footer>
          <button className="btn btn-secondary" type="button" tabIndex="1" onClick={onClose}>Cancel import</button>
          <button className="btn btn-primary" type="submit" tabIndex="2">Confirm</button>
        </Modal.Footer>
      </form>
    </Modal>
  );
};

export default TransactionsImportDuplicatesModal;

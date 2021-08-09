import {useState, useEffect} from 'react';

import Modal from 'react-bootstrap/Modal';
import TransactionDetailModalInput from './../TransactionDetailModalInput';

import {nullCoalesce, formatTransactionDisplay} from './../../utilities';

import './index.scss';

const TransactionDetailModal = ({ transaction, buttonsOptions, isOpen, onClose, onSubmit })=>{
  const [PostedDate, setPostedDate] = useState(""); //empty string, as initial value for input[type="text"]
  const [TransactionDate, setTransactionDate] = useState(""); //empty string, as initial value for input[type="text"]
  const [AccountNumber, setAccountNumber] = useState(""); //empty string, as initial value for input[type="text"]
  const [Amount, setAmount] = useState(""); //empty string, as initial value for input[type="text"]
  const [Description, setDescription] = useState(""); //empty string, as initial value for input[type="text"]
  const [DescriptionDisplay, setDescriptionDisplay] = useState(""); //empty string, as initial value for input[type="text"]
  const [Category, setCategory] = useState(""); //empty string, as initial value for input[type="text"]
  const [Type, setType] = useState(""); //empty string, as initial value for input[type="text"]
  const [Notes, setNotes] = useState(""); //empty string, as initial value for input[type="text"]
  const [Tags, setTags] = useState([]);

  useEffect(()=>{
    if(!transaction) return;

    console.log("Updating TransactionDetailModal state based on updated prop \"transaction\".", transaction, PostedDate, TransactionDate, AccountNumber, Amount, Description, Category, Notes, Type, Tags)
    const transactionDisplay = formatTransactionDisplay(transaction);
    setPostedDate(transactionDisplay.PostedDate);
    setTransactionDate(transactionDisplay.TransactionDate);
    setAccountNumber(transactionDisplay.AccountNumber);
    setAmount(transactionDisplay.Amount);
    setDescription(transactionDisplay.Description);
    setDescriptionDisplay(transactionDisplay.DescriptionDisplay);
    setCategory(transactionDisplay.Category);
    setNotes(transactionDisplay.Notes);
    setType(transactionDisplay.Type);
    setTags(transactionDisplay.Tags);
  }, [transaction]);

  const categories = [
    "",
    "Savings",
    "Gas",
    "Church",
    "Groceries/Necessities",
    "LoveInAction",
    "Family Outings",
    "Personal Spending",
    "Miscellaneous",
    "Sharonview mortgage & escrow",
    "HOA dues",
    "Duke Energy",
    "SJWD Water District",
    "Piedmont Natural Gas",
    "Kirby Sanitation",
    "Laurens Electric ProTec Security",
    "SimpliSafe (for mom)",
    "AT&T Internet",
    "State Farm auto insurance",
    "AT&T phone bill",
    "Spotify Premium subscription",
    "Netflix Premium subscription",
    "Discovery Plus subscription",
    "YMCA membership",
  ];

  const types = [
    "",
    "Charges",
    "Payments",
    "Debit",
    "Credit",
  ];

  const transactionDetails = [
    {name: "PostedDate", placeholder: "PostedDate", value: PostedDate, tag: "input", tagType: "text", setState: setPostedDate, disabled: false},
    {name: "TransactionDate", placeholder: "TransactionDate", value: TransactionDate, tag: "input", tagType: "text", setState: setTransactionDate, disabled: false},
    {name: "AccountNumber", placeholder: "Account Number", value: AccountNumber, tag: "input", tagType: "text", setState: setAccountNumber, disabled: false},
    {name: "Amount", placeholder: "Amount", value: Amount, tag: "input", tagType: "text", setState: setAmount, disabled: false},
    {name: "Description", placeholder: "Description", value: Description, tag: "input", tagType: "text", setState: setDescription, disabled: true},
    {name: "DescriptionDisplay", placeholder: "Description", value: DescriptionDisplay, tag: "input", tagType: "text", setState: setDescriptionDisplay, disabled: false},
    {name: "Category", placeholder: "Select a category...", value: Category, items: categories, tag: "input", tagType: "text", setState: setCategory, disabled: false},
    {name: "Type", placeholder: "Select a type...", value: Type, items: types, tag: "input", tagType: "text", setState: setType, disabled: false},
    {name: "Notes", placeholder: "Notes", value: Notes, tag: "textarea", tagType: null, setState: setNotes, disabled: false},
    {name: "Tags", placeholder: "Tags", value: Tags, tag: "input", tagType: "text", setState: setTags, disabled: false},
  ];

  const onTransactionDetailInputContainerClick = event=>{
    const transactionDetailInput = event.target;
    if (transactionDetailInput.getAttribute("data-stay-disabled")) return;
    transactionDetailInput.disabled = false;
    transactionDetailInput.focus();
  };

  const onTransactionDetailInputContainerBlur = event=>{
    const transactionDetailInput = event.target;
    if (transactionDetailInput.getAttribute("data-stay-disabled")) return;
    transactionDetailInput.disabled = true;
  };

  const onTransactionDetailInputChange = (event, transactionDetail)=>{
    transactionDetail.setState(event.target.value)
  };

  const onTransactionDetailInputKeyDown = event=>{
    const transactionDetailInput = event.target;
    if (event.keyCode === 9 /* Tab */) {
      event.preventDefault();
      const nextOrPrevious = (event.shiftKey === true ? -1 : 1);
      const inputsArray = [...new Set([...document.querySelector(".transaction-modal-form").querySelectorAll(".transaction-modal-input"), ...document.querySelector(".transaction-modal-form").querySelectorAll("[tabIndex]")])];
      const nextInput = inputsArray[(inputsArray.indexOf(transactionDetailInput)+nextOrPrevious+inputsArray.length)%inputsArray.length];
      if (nextInput) {
        nextInput.disabled = false;
        nextInput.focus();
      }
      return;
    }
    if (event.key === "Enter") {
      event.preventDefault();

      if (transactionDetailInput.classList.contains("transaction-modal-input-tags")) {
        setTags([...Tags, transactionDetailInput.value]);

        //Reset the input
        transactionDetailInput.value = '';

        return;
      }

      transactionDetailInput.disabled = true;
      return;
    }
  };

  const transactionModalFormOnSubmit = event=>{
    const transactionModalForm = event.target;

    //Prevent the form from submitting
    event.preventDefault();

    //Aggregate the form data into an object
    const data = [...transactionModalForm.querySelectorAll("[name]")].reduce((accumulator,input)=>{
      const obj = {};
      let {name, value} = input;
      value = (name === "Tags" ? (value ? value.split(/\s*,\s*/) : []) : value);

      obj[name] = (value instanceof Array && value.length === 0 ? [] : nullCoalesce(value));
      return accumulator = {...accumulator, ...obj};
    }, {});
    console.log("Data submitted from TransactionDetailModal", data);

    //Update the transaction with the new form data
    const updatedTransaction = {
      ...transaction, //previous transaction data
      ...data, //new transaction data from the form
      Description: transaction.Description, //make sure to never change the actual Description
    };

    console.log("Updated transaction submitted from TransactionDetailModal", updatedTransaction);

    onSubmit(updatedTransaction);
  };

  const onTagBadgeClick = tag=>{
    setTags(Tags.filter(t=>t!==tag));
  };

  return (
    <Modal id="transaction-modal" show={isOpen} onHide={onClose}>
      <Modal.Header>
        <Modal.Title className="modal-title">Transaction Detail</Modal.Title>
        <button className="btn-close" type="button" onClick={onClose}></button>
      </Modal.Header>
      <form className="transaction-modal-form" onSubmit={transactionModalFormOnSubmit}>
        <Modal.Body>
          {transactionDetails.map((transactionDetail, i)=>(
            <TransactionDetailModalInput key={transactionDetail.name} transactionDetail={transactionDetail} tabIndex={i+1} onClick={onTransactionDetailInputContainerClick} onBlur={onTransactionDetailInputContainerBlur} onChange={(event)=>onTransactionDetailInputChange(event, transactionDetail)} onKeyDown={onTransactionDetailInputKeyDown} onTagBadgeClick={onTagBadgeClick} />
          ))}
        </Modal.Body>
        <Modal.Footer>
          {Object.entries(buttonsOptions).map((buttonObj, i)=>(
            <button key={buttonObj[0]} className={`btn ${(buttonObj[0] === "okButton" ? "btn-primary" : (buttonObj[0] === "cancelButton" ? "btn-secondary" : ''))}`} type={(buttonObj[0] === "okButton" ? "submit" : "button")} {...(buttonObj[0] === "cancelButton" ? {"data-bs-dismiss": "modal"} : '')} tabIndex={transactionDetails.length+i+1} onKeyDown={onTransactionDetailInputKeyDown} {...(buttonObj[0] === "cancelButton" ? {onClick: onClose} : '')} >{buttonObj[1]}</button>
          ))}
        </Modal.Footer>
      </form>
    </Modal>
  );
};

export default TransactionDetailModal;

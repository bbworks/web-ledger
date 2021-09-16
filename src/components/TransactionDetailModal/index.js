import {useState, useEffect} from 'react';

import Modal from 'react-bootstrap/Modal';
import TransactionDetailModalInput from './../TransactionDetailModalInput';

import {nullCoalesce, formatTransactionDisplay, getBudgetCycleString, getBudgetCycleFromBudgetCycleString} from './../../utilities';

import './index.scss';

const TransactionDetailModal = ({ transaction, allBudgetCycles, categories, types, buttonsOptions, isOpen, onClose, onSubmit })=>{
  const [BudgetCycle, setBudgetCycle] = useState(""); //empty string, as initial value for input[type="text"]
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

  const transactionDetails = [
    {name: "BudgetCycle", placeholder: "Select a budget cycle", value: BudgetCycle, items: allBudgetCycles.map(b=>getBudgetCycleString(b)), tag: "input", tagType: "text", setState: setBudgetCycle, disabled: false},
    {name: "PostedDate", placeholder: "Posted Date", value: PostedDate, tag: "input", tagType: "text", setState: setPostedDate, disabled: false},
    {name: "TransactionDate", placeholder: "Transaction Date", value: TransactionDate, tag: "input", tagType: "text", setState: setTransactionDate, disabled: false},
    {name: "AccountNumber", placeholder: "Account Number", value: AccountNumber, tag: "input", tagType: "text", setState: setAccountNumber, disabled: false},
    {name: "Amount", placeholder: "Amount", value: Amount, tag: "input", tagType: "text", setState: setAmount, disabled: false},
    {name: "Description", placeholder: "Description", value: Description, tag: "input", tagType: "text", setState: setDescription, disabled: true},
    {name: "DescriptionDisplay", placeholder: "Description", value: DescriptionDisplay, tag: "input", tagType: "text", setState: setDescriptionDisplay, disabled: false},
    {name: "Category", placeholder: "Select a category...", value: Category, items: categories, tag: "input", tagType: "text", setState: setCategory, disabled: false},
    {name: "Type", placeholder: "Select a type...", value: Type, items: types, tag: "input", tagType: "text", setState: setType, disabled: false},
    {name: "Notes", placeholder: "Notes", value: Notes, tag: "textarea", tagType: null, setState: setNotes, disabled: false},
    {name: "Tags", placeholder: "Tags", value: Tags, tag: "input", tagType: "text", setState: setTags, disabled: false},
  ];

  //When the transaction changes,
  // or the modal is opened or closed,
  // reset the state
  useEffect(()=>{
    if(!transaction) return;

    const transactionDisplay = formatTransactionDisplay(transaction);
    setBudgetCycle(transactionDisplay.BudgetCycle);
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
    console.log("Updating TransactionDetailModal state based on updated prop \"transaction\".", transaction, PostedDate, TransactionDate, AccountNumber, Amount, Description, Category, Notes, Type, Tags)
  }, [transaction, isOpen]);

  const onTransactionDetailInputChange = (event, transactionDetail)=>{
    const newValue = event.target.value;
    transactionDetail.setState(newValue);
  };

  const onTransactionDetailInputKeyPress = event=>{
    const transactionDetailInput = event.target;

    //If the "Enter" key is pressed on input[name="Tags"],
    // append the newly added tag
    if (event.key === "Enter") {
      if (transactionDetailInput.classList.contains("transaction-detail-modal-input-tags")) {
        event.preventDefault();

        const newValue = transactionDetailInput.value;

        //Add the additional tag
        setTags([...Tags, transactionDetailInput.value]);

        //Reset the input
        transactionDetailInput.value = '';

        return;
      }
    }
  };

  const transactionModalFormOnSubmit = event=>{
    const transactionModalForm = event.target;
    const formattedTransaction = formatTransactionDisplay(transaction);

    //Prevent the form from submitting
    event.preventDefault();

    //Aggregate the form data into an object,
    // and add that the transaction has been
    // updated by the user
    const data = [...transactionModalForm.querySelectorAll("[name]")].reduce((accumulator,{name, value})=>{
      //If the value has not changed, return
      if (value === formattedTransaction[name]) return accumulator;

      //Vaildate the value
      value = (name === "Tags" ? (value ? value.split(/\s*,\s*/) : []) : value); //Tags validation
      value = (name === "BudgetCycle" ? (value ? getBudgetCycleFromBudgetCycleString(value) : null) : value); //BudgetCycle validation
      value = (value instanceof Array && value.length === 0 ? [] : nullCoalesce(value)) //Array validation

      return {
        ...accumulator,
        [name]: value,
      };
    }, {
      IsUpdatedByUser: true,
      DateModified: new Date(),
    });
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
    <Modal id="transaction-detail-modal" show={isOpen} onHide={onClose}>
      <Modal.Header>
        <Modal.Title className="modal-title">Transaction Detail</Modal.Title>
        <button className="btn-close" type="button" onClick={onClose}></button>
      </Modal.Header>
      <form className="transaction-detail-modal-form" onSubmit={transactionModalFormOnSubmit}>
        <Modal.Body>
          {transactionDetails.map((transactionDetail, i)=>(
            <TransactionDetailModalInput key={transactionDetail.name} transactionDetail={transactionDetail} tabIndex={i+1} onChange={(event)=>onTransactionDetailInputChange(event, transactionDetail)} onKeyPress={onTransactionDetailInputKeyPress} onTagBadgeClick={onTagBadgeClick} />
          ))}
        </Modal.Body>
        <Modal.Footer>
          <button className="btn btn-secondary" type="button" tabIndex={transactionDetails.length+1} onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" type="submit" tabIndex={transactionDetails.length+2}>Save</button>
        </Modal.Footer>
      </form>
    </Modal>
  );
};

export default TransactionDetailModal;

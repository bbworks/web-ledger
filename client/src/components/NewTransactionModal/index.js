import {useState, useEffect} from 'react';

import TransactionDetailModalInput from './../TransactionDetailModalInput';
import Modal from 'react-bootstrap/Modal';

import {nullCoalesce, formatTransactionDisplay, getBudgetCycleString, getBudgetCycleFromBudgetCycleString, convertNumberToCurrency} from './../../utilities';

import './index.scss';

const NewTransactionModal = ({ budgetCycle, allBudgetCycles, categories, types, isOpen, onClose, onSubmit:onSubmitProp })=>{
  const [BudgetCycle, setBudgetCycle] = useState(getBudgetCycleString(budgetCycle));
  const [PostedDate, setPostedDate] = useState("");
  const [TransactionDate, setTransactionDate] = useState((new Date().toLocaleDateString("en-US", {timeZone: "UTC"}).toString() || ""));
  const [AccountNumber, setAccountNumber] = useState("");
  const [Amount, setAmount] = useState("");
  const [Description, setDescription] = useState("");
  const [DescriptionDisplay, setDescriptionDisplay] = useState("");
  const [Category, setCategory] = useState("");
  const [Type, setType] = useState("");
  const [Notes, setNotes] = useState("");
  const [Tags, setTags] = useState([]);

  const transactionDetails = [
    {name: "BudgetCycle", placeholder: "Select a budget cycle", value: BudgetCycle, items: allBudgetCycles.map(b=>getBudgetCycleString(b)), tag: "input", tagType: "text", setState: setBudgetCycle, disabled: false},
    {name: "PostedDate", placeholder: "Posted Date", value: PostedDate, tag: "input", tagType: "text", setState: setPostedDate, disabled: false},
    {name: "TransactionDate", placeholder: "Transaction Date", value: TransactionDate, tag: "input", tagType: "text", setState: setTransactionDate, disabled: false},
    {name: "AccountNumber", placeholder: "Account Number", value: AccountNumber, tag: "input", tagType: "text", setState: setAccountNumber, disabled: false},
    {name: "Amount", placeholder: "Amount", value: Amount, tag: "input", tagType: "text", setState: setAmount, disabled: false},
    {name: "Description", placeholder: "Description", value: Description, tag: "input", tagType: "text", setState: setDescription},
    {name: "DescriptionDisplay", placeholder: "Description", value: DescriptionDisplay, tag: "input", tagType: "text", setState: setDescriptionDisplay, disabled: false},
    {name: "Category", placeholder: "Select a category...", value: Category, items: categories, tag: "InputDropdown", tagType: null, setState: setCategory, disabled: false},
    {name: "Type", placeholder: "Select a type...", value: Type, items: types, tag: "InputDropdown", tagType: null, setState: setType, disabled: false},
    {name: "Notes", placeholder: "Notes", value: Notes, tag: "textarea", tagType: null, setState: setNotes, disabled: false},
    {name: "Tags", placeholder: "Tags", value: Tags, tag: "input", tagType: "text", setState: setTags, disabled: false},
  ];

  const onTransactionDetailInputChange = (value, transactionDetail)=>{
    return transactionDetail.setState(value);
  };

  const onInputDropdownSubmit = (value, transactionDetail)=>{
    return transactionDetail.setState(value);
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

  const onTagBadgeClick = tag=>{
    setTags(Tags.filter(t=>t!==tag));
  };

  // const onSubmit = event=>{
  //   const now = new Date();
  //
  //   //Prevent the form from submitting
  //   event.preventDefault();
  //
  //   // const transactionModalForm = event.target;
  //   // const formattedTransaction = formatTransactionDisplay(transaction);
  //
  //   //Aggregate the form data into an object,
  //   // and add that the transaction has been
  //   // updated by the user
  //   const value = transactionDetails.reduce((accumulator, {name, value})=>{
  //     //Vaildate the value
  //     value = (name === "BudgetCycle" ? (value ? getBudgetCycleFromBudgetCycleString(value) : null) : value); //BudgetCycle validation
  //     value = (name === "Amount" ? (value ? value.replace(/(\$|,)/g, "") : null) : value); //Amount validation
  //
  //     return {
  //       ...accumulator,
  //       [name]: value,
  //     };
  //   }, {
  //     DateCreated: now,
  //     DateModified: now,
  //   });
  //
  //   //Re-organize the properties
  //   const finalValue = {
  //     Name: value.Name,
  //     Amount: value.Amount,
  //     Type: value.Type,
  //     Group: value.Group,
  //     DueDate: value.DueDate,
  //     IsPaidByCreditCardNotAccount: value.IsPaidByCreditCardNotAccount,
  //     BudgetCycle: value.BudgetCycle,
  //     DateCreated: value.DateCreated,
  //     DateModified: value.DateModified,
  //   }
  //
  //   console.log("Data submitted from NewTransactionModal", finalValue);
  //
  //   onSubmitProp(finalValue);
  // };

  const onSubmit = event=>{
    const now = new Date();

    //Prevent the form from submitting
    event.preventDefault();

    //Aggregate the form data into an object,
    // and add that the transaction has been
    // updated by the user
    const value = transactionDetails.reduce((accumulator, {name, value})=>{
      //Vaildate the value
      value = (name === "BudgetCycle" ? (value ? getBudgetCycleFromBudgetCycleString(value) : null) : value); //BudgetCycle validation
      value = (name === "Amount" ? (value ? value.replace(/(\$|,)/g, "") : null) : value); //Amount validation
      value = (name === "Transaction Date" ? (value ? value : null) : value); //Amount validation

      return {
        ...accumulator,
        [name]: value,
      };
    }, {
      TransactionId: "",
      IsAutoCategorized: false,
      IsUpdatedByUser: false,
      IsUpdatedByUser: false,
      DateCreated: now,
      DateModified: now,
    });

    //Re-organize the properties
    const finalValue = {
      TransactionId: value.TransactionId,
  		PostedDate: value.PostedDate,
  		TransactionDate: value.TransactionDate,
  		AccountNumber: value.AccountNumber,
  		Type: value.Type,
  		Description: value.Description,
  		DescriptionDisplay: value.DescriptionDisplay,
  		Amount: value.Amount,
  		Category: value.Category,
  		Notes: value.Notes,
  		Tags: value.Tags,
  		BudgetCycle: value.BudgetCycle,
  		IsAutoCategorized: value.IsAutoCategorized,
  		IsUpdatedByUser: value.IsUpdatedByUser,
  		DateCreated: value.DateCreated,
  		DateModified: value.DateModified,
    };

    console.log("Data submitted from NewTransactionModal", finalValue);

    onSubmitProp(finalValue);
  };

  useEffect(()=>{
    setBudgetCycle(getBudgetCycleString(budgetCycle));
  }, [budgetCycle]);


  return (
    <Modal id="new-transaction-modal" show={isOpen} onHide={onClose}>
      <Modal.Header>
        <Modal.Title className="modal-title">New Transaction</Modal.Title>
        <button className="btn-close" type="button" onClick={onClose}></button>
      </Modal.Header>
      <form className="new-transaction-modal-form" onSubmit={onSubmit}>
        <Modal.Body>
          {transactionDetails.map((transactionDetail, i)=>(
            <TransactionDetailModalInput key={transactionDetail.name} transactionDetail={transactionDetail} tabIndex={i+1} onChange={(value)=>onTransactionDetailInputChange(value, transactionDetail)} onInputDropdownSubmit={(value)=>onInputDropdownSubmit(value, transactionDetail)} />
          ))}
        </Modal.Body>
        <Modal.Footer>
          <button className="btn btn-secondary" type="button" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" type="submit">Create</button>
        </Modal.Footer>
      </form>
    </Modal>
  );
};

export default NewTransactionModal;

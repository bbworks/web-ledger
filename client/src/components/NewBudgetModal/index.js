import {useState, useEffect} from 'react';

import TransactionDetailModalInput from './../TransactionDetailModalInput';
import Modal from 'react-bootstrap/Modal';

import {getBudgetCycleString, getBudgetCycleFromBudgetCycleString, convertNumberToCurrency} from './../../utilities';

import './index.scss';

const NewBudgetModal = ({ budgetCycle, allBudgetCycles, types, groups, isOpen, onClose, onSubmit:onSubmitProp })=>{
  const [BudgetCycle, setBudgetCycle] = useState(getBudgetCycleString(budgetCycle)); //empty string, as initial value for input[type="text"]
  const [Name, setName] = useState(""); //empty string, as initial value for input[type="text"]
  const [Amount, setAmount] = useState(""); //empty string, as initial value for input[type="text"]
  const [Type, setType] = useState(""); //empty string, as initial value for input[type="text"]
  const [Group, setGroup] = useState(""); //empty string, as initial value for input[type="text"]
  const [DueDate, setDueDate] = useState(""); //empty string, as initial value for input[type="text"]
  const [IsPaidByCreditCardNotAccount, setIsPaidByCreditCardNotAccount] = useState(""); //empty string, as initial value for input[type="text"]

  const [isBillOptionsOpen, setIsBillOptionsOpen] = useState(false); //empty string, as initial value for input[type="text"]

  const budgetDetails = [
    {name: "BudgetCycle", placeholder: "Select a budget cycle", value: BudgetCycle, items: allBudgetCycles.map(b=>getBudgetCycleString(b)), tag: "input", tagType: "text", setState: setBudgetCycle, disabled: false},
    {name: "Name", placeholder: "Name", value: Name, tag: "input", tagType: "text", setState: setName, disabled: false},
    {name: "Amount", placeholder: "Amount", value: Amount, tag: "input", tagType: "text", setState: setAmount, disabled: false},
    {name: "Type", placeholder: "Type", value: Type, items: types, tag: "input", tagType: "text", setState: setType, disabled: false},
    {name: "Group", placeholder: "Group", value: Group, items: groups, tag: "input", tagType: "text", setState: setGroup, disabled: false},
    {name: "DueDate", placeholder: "Due Date", value: DueDate, tag: "input", tagType: "text", setState: setDueDate, disabled: false},
    {name: "IsPaidByCreditCardNotAccount", label: "Charged to Credit Card?", value: IsPaidByCreditCardNotAccount, tag: "input", tagType: "checkbox", setState: setIsPaidByCreditCardNotAccount, disabled: false},
  ];

  const onTransactionDetailInputChange = (value, budgetDetail)=>{
    return budgetDetail.setState(value);
  };

  const onInputDropdownSubmit = (value, budgetDetail)=>{
    return budgetDetail.setState(value);
  };

  const onSubmit = event=>{
    const now = new Date();

    //Prevent the form from submitting
    event.preventDefault();

    // const transactionModalForm = event.target;
    // const formattedTransaction = formatTransactionDisplay(transaction);

    //Aggregate the form data into an object,
    // and add that the transaction has been
    // updated by the user
    const value = budgetDetails.reduce((accumulator, {name, value})=>{
      //Vaildate the value
      value = (name === "BudgetCycle" ? (value ? getBudgetCycleFromBudgetCycleString(value) : null) : value); //BudgetCycle validation
      value = (name === "Amount" ? (value ? value.replace(/(\$|,)/g, "") : null) : value); //Amount validation

      return {
        ...accumulator,
        [name]: value,
      };
    }, {
      DateCreated: now,
      DateModified: now,
    });

    //Re-organize the properties
    const finalValue = {
      Name: value.Name,
      Amount: value.Amount,
      Type: value.Type,
      Group: value.Group,
      DueDate: value.DueDate,
      IsPaidByCreditCardNotAccount: value.IsPaidByCreditCardNotAccount,
      BudgetCycle: value.BudgetCycle,
      DateCreated: value.DateCreated,
      DateModified: value.DateModified,
    }

    console.log("Data submitted from NewBudgetModal", finalValue);

    onSubmitProp(finalValue);
  };

  //Set default budget groups for each selected budget type
  useEffect(()=>{
    if(!Type) return setGroup("");

    if (Type === "income") return setGroup("Income");

    if (Type === "expense") return setGroup("Miscellaneous");

    if (Type === "savings") return setGroup("Savings");

    if (Type === "bill") return setGroup("Housing");
  }, [Type, setGroup]);

  useEffect(()=>{
    //When first switching to bill type,
    // initialize IsPaidByCreditCardNotAccount to false (not NULL)
    if(Type === "bill") return setIsBillOptionsOpen(previousIsBillOptionsOpen=>{
      if (!previousIsBillOptionsOpen) setIsPaidByCreditCardNotAccount(false);
      return true;
    });


    //When switched off of bill,
    // clear the unneeded bill budget options
    setDueDate("");
    setIsPaidByCreditCardNotAccount("");
    return setIsBillOptionsOpen(false);
  }, [Type, setDueDate, setIsPaidByCreditCardNotAccount]);


  return (
    <Modal id="new-budget-modal" show={isOpen} onHide={onClose}>
      <Modal.Header>
        <Modal.Title className="modal-title">New Budget</Modal.Title>
        <button className="btn-close" type="button" onClick={onClose}></button>
      </Modal.Header>
      <form className="new-budget-modal-form" onSubmit={onSubmit}>
        <Modal.Body>
          {budgetDetails.map((budgetDetail, i)=>(
            !isBillOptionsOpen && ["DueDate", "IsPaidByCreditCardNotAccount"].includes(budgetDetail.name) ?
            null :
            <TransactionDetailModalInput key={budgetDetail.name} transactionDetail={budgetDetail} tabIndex={i+1} onChange={(value)=>onTransactionDetailInputChange(value, budgetDetail)} onInputDropdownSubmit={(value)=>onInputDropdownSubmit(value, budgetDetail)} />
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

export default NewBudgetModal;

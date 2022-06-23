import {useState, useEffect} from 'react';

import TransactionDetailModalInput from './../TransactionDetailModalInput';
import InputDropdown from './../InputDropdown';
import Modal from 'react-bootstrap/Modal';

import {getBudgetCycleString, getBudgetCycleFromBudgetCycleString, convertNumberToCurrency, convertCurrencyToNumber} from './../../utilities';
import {useBudgetCycleBudgets} from './../../hooks';

import './index.scss';

const CloneBudgetModal = ({ budgetCycle, budgetsData, types, groups, allBudgetCycles, isOpen, onClose, onSubmit:onSubmitProp })=>{
  const getPreviousBudgetCycleWithBudgets = (allBudgetCycles, budgetCycle)=>{
    if (!budgetCycle) return;
    const allBudgetCyclesSorted = allBudgetCycles.sort((a,b)=>b.getTime()-a.getTime());
    return allBudgetCyclesSorted.find((b, i)=>(i===0 ? false : allBudgetCyclesSorted[i-1].getTime() === budgetCycle.getTime()));
  };

  const previousBudgetCycle = getPreviousBudgetCycleWithBudgets(allBudgetCycles, budgetCycle);

  const [BudgetCycle, setBudgetCycle] = useState(previousBudgetCycle); //empty string, as initial value for input[type="text"]

  const budgetCycleBudgets = useBudgetCycleBudgets(budgetsData, BudgetCycle);

  const [clonedBudgetCycleBudgets, setClonedBudgetCycleBudgets] = useState(budgetCycleBudgets); //empty string, as initial value for input[type="text"]

  const [isBillOptionsOpen, setIsBillOptionsOpen] = useState(false); //empty string, as initial value for input[type="text"]

  const inputOptions = [
    {name: "BudgetCycle", placeholder: "Select a budget cycle", value: getBudgetCycleString(BudgetCycle), items: allBudgetCycles.map(b=>getBudgetCycleString(b)), tag: "input", tagType: "text", setState: setBudgetCycle, disabled: false},
  ];


  const onClonedBudgetCycleChange = (value, inputOption)=>{
    return inputOption.setState(getBudgetCycleFromBudgetCycleString(value));
  };

  const onClonedBudgetCycleSubmit = (value, inputOption)=>{
    return inputOption.setState(getBudgetCycleFromBudgetCycleString(value));
  };

  const onInputChange = (name, value, i)=>{
    console.log(name, value, i);
    setClonedBudgetCycleBudgets(previousClonedBudgetCycleBudgets=>[
      ...previousClonedBudgetCycleBudgets.slice(0,i),
      {
        ...previousClonedBudgetCycleBudgets[i],
        [name]: value,
      },
      ...previousClonedBudgetCycleBudgets.slice(i+1),
    ]);
  };

  const onSubmit = event=>{
    event.preventDefault();

    const now = new Date();

    //Vaildate the state values into an array of objects,
    // with updated DateCreated, DateModified values
    const value = clonedBudgetCycleBudgets.map(e=>({
      ...e,
      BudgetCycle: budgetCycle,
      Amount: convertCurrencyToNumber(e.Amount),
      DateCreated: now,
      DateModified: now,
    }));

    console.log("Data submitted from CloneBudgetModal", value);

    onSubmitProp(value);
  };

  //Whenever budgetCycleBudgets gets updated,
  // update the clonedBudgetCycleBudgets
  useEffect(()=>{
    setClonedBudgetCycleBudgets(budgetCycleBudgets);
  }, [budgetCycleBudgets]);


  return (
    <Modal id="clone-budget-modal" className="clone-budget-modal" show={isOpen} onHide={onClose}>
      <Modal.Header>
        <Modal.Title className="modal-title">Clone Budget</Modal.Title>
        <button className="btn-close" type="button" onClick={onClose}></button>
      </Modal.Header>
      <form className="clone-budget-modal-form" onSubmit={onSubmit}>
        <Modal.Body>
          {
            inputOptions.map((inputOption, i)=><TransactionDetailModalInput key={inputOption.name} transactionDetail={inputOption} tabIndex={i+1} onChange={(value)=>onClonedBudgetCycleChange(value, inputOption)} onInputDropdownSubmit={(value)=>onClonedBudgetCycleSubmit(value, inputOption)} />)
          }
          {clonedBudgetCycleBudgets.map((budgetCycleBudget, i)=>(
            <div className="clone-budget-modal-form-input-group">
              <input className="clone-budget-modal-form-input-text clone-budget-modal-form-input-text-name" type="text" name={`clone-budget-${i+1}-name`} value={budgetCycleBudget.Name || ""} onChange={(event)=>onInputChange("Name", event.target.value, i)} />
              <input className="clone-budget-modal-form-input-text clone-budget-modal-form-input-text-amount" type="text" name={`clone-budget-${i+1}-amount`} value={(!isNaN(Number(budgetCycleBudget.Amount)) ? convertNumberToCurrency(budgetCycleBudget.Amount) : budgetCycleBudget.Amount) || ""} onChange={(event)=>onInputChange("Amount", event.target.value, i)} />
              <InputDropdown className="clone-budget-modal-form-input-text clone-budget-modal-form-input-text-type" type="text" name={`clone-budget-${i+1}-type`} value={budgetCycleBudget.Type || ""} items={types} onChange={(value)=>onInputChange("Type", value, i)} />
              <InputDropdown className="clone-budget-modal-form-input-text clone-budget-modal-form-input-text-group" type="text" name={`clone-budget-${i+1}-group`} value={budgetCycleBudget.Group || ""} items={groups} onChange={(value)=>onInputChange("Group", value, i)} />
              <input className="clone-budget-modal-form-input-text clone-budget-modal-form-input-text-duedate" type="hidden" name={`clone-budget-${i+1}-duedate`} value={budgetCycleBudget.DueDate || ""} onChange={(event)=>onInputChange("DueDate", event.target.value, i)} />
              <input className="clone-budget-modal-form-input-text clone-budget-modal-form-input-text-Ispaidbycreditcardnotaccount" type="hidden" name={`clone-budget-${i+1}-Ispaidbycreditcardnotaccount`} value={!(budgetCycleBudget.IsPaidByCreditCardNotAccount === null || budgetCycleBudget.IsPaidByCreditCardNotAccount === undefined) && budgetCycleBudget.IsPaidByCreditCardNotAccount.toString() || ""} onChange={(event)=>onInputChange("IsPaidByCreditCardNotAccount", event.target.value, i)} />
              <input className="clone-budget-modal-form-input-text clone-budget-modal-form-input-text-budgetcycle" type="hidden" name={`clone-budget-${i+1}-budgetcycle`} value={budgetCycle || ""} />
            </div>
          ))}
        </Modal.Body>
        <Modal.Footer>
          <button className="btn btn-secondary" type="button" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" type="submit">Clone</button>
        </Modal.Footer>
      </form>
    </Modal>
  );
};

export default CloneBudgetModal;

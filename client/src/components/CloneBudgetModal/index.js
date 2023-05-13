import {useState, useEffect} from 'react';

import TransactionDetailModalInput from './../TransactionDetailModalInput';
import InputDropdown from './../InputDropdown';
import Modal from 'react-bootstrap/Modal';

import {getBudgetCycleString, getBudgetCycleFromBudgetCycleString, convertNumberToCurrencyString, convertCurrencyToNumber} from './../../utilities';
import {useBudgetCycleBudgets} from './../../hooks';

import './index.scss';

const CloneBudgetModal = ({ budgetCycle, budgetsData, types, groups, allBudgetCycles, isOpen, onClose, onSubmit:onSubmitProp })=>{
  const getPreviousBudgetCycleWithBudgets = (allBudgetCycles, budgetCycle)=>{
    if (!budgetCycle) return;
    const allBudgetCyclesSorted = allBudgetCycles.sort((a,b)=>b.getTime()-a.getTime());
    const previousBudgetCycle = allBudgetCyclesSorted.find((b, i)=>(i===0 ? false : allBudgetCyclesSorted[i-1].getTime() === budgetCycle.getTime()));
    if (previousBudgetCycle) return previousBudgetCycle;
    return allBudgetCyclesSorted.find(b=>b.getTime() < budgetCycle.getTime());
  };

  const previousBudgetCycle = getPreviousBudgetCycleWithBudgets(allBudgetCycles, budgetCycle);

  const [BudgetCycle, setBudgetCycle] = useState(previousBudgetCycle);

  const budgetCycleBudgets = useBudgetCycleBudgets(budgetsData, BudgetCycle);

  const [clonedBudgetCycleBudgets, setClonedBudgetCycleBudgets] = useState(budgetCycleBudgets);

  const [isBillOptionsOpen, setIsBillOptionsOpen] = useState(false);

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
      BudgetId: "",
      BudgetCycle: budgetCycle,
      Amount: convertCurrencyToNumber(e.Amount),
      DateCreated: now,
      DateModified: now,
    }));

    console.log("Data submitted from CloneBudgetModal", value);

    onSubmitProp(value);
  };

  const onInputGroupMouseDeleteButtonClick = index=>{
    setClonedBudgetCycleBudgets(previousClonedBudgetCycleBudgets=>[
      ...previousClonedBudgetCycleBudgets.slice(0, index),
      ...previousClonedBudgetCycleBudgets.slice(index+1),
    ]);
  };

  const onAddButtonClick = ()=>{
    setClonedBudgetCycleBudgets(previousClonedBudgetCycleBudgets=>[
      ...previousClonedBudgetCycleBudgets,
      {
        Name: null,
        Amount: null,
        Type: null,
        Group: null,
        DueDate: null,
        IsPaidByCreditCardNotAccount: null,
        BudgetCycle: null,
        DateCreated: null,
        DateModified: null,
      },
    ]);
  };


  //Whenever budgetCycleBudgets gets updated,
  // update the clonedBudgetCycleBudgets
  useEffect(()=>{
    setClonedBudgetCycleBudgets(budgetCycleBudgets);
  }, [budgetCycleBudgets]);

  //Whenever budgetCycle gets updated,
  // update the previousBudgetCycle
  useEffect(()=>{
    setBudgetCycle(previousBudgetCycle);
  }, [budgetCycle]);


  return (
    <Modal id="clone-budget-modal" className="clone-budget-modal" show={isOpen} onHide={onClose}>
      <Modal.Header>
        <Modal.Title className="modal-title">Clone Budget</Modal.Title>
        <button className="btn-close" type="button" onClick={onClose}></button>
      </Modal.Header>
      <form className="clone-budget-modal-form" onSubmit={onSubmit}>
        <Modal.Body>
          {
            inputOptions.map((inputOption, i)=>(
              <TransactionDetailModalInput key={inputOption.name} transactionDetail={inputOption} tabIndex={i+1} onChange={(value)=>onClonedBudgetCycleChange(value, inputOption)} onInputDropdownSubmit={(value)=>onClonedBudgetCycleSubmit(value, inputOption)} />
            ))
          }
          <div>
            {clonedBudgetCycleBudgets.map((budgetCycleBudget, i)=>(
              <div key={i} className="clone-budget-modal-form-input-group">
                <input className="clone-budget-modal-form-input-text clone-budget-modal-form-input-text-name" type="text" name={`clone-budget-${i+1}-name`} value={budgetCycleBudget.Name || ""} onChange={(event)=>onInputChange("Name", event.target.value, i)} />
                <input className="clone-budget-modal-form-input-text clone-budget-modal-form-input-text-amount" type="text" name={`clone-budget-${i+1}-amount`} value={(!isNaN(Number(budgetCycleBudget.Amount)) ? convertNumberToCurrencyString(budgetCycleBudget.Amount) : budgetCycleBudget.Amount) || ""} onChange={(event)=>onInputChange("Amount", event.target.value, i)} />
                <InputDropdown className="clone-budget-modal-form-input-text clone-budget-modal-form-input-text-type" type="text" name={`clone-budget-${i+1}-type`} value={budgetCycleBudget.Type || ""} items={types} onChange={(value)=>onInputChange("Type", value, i)} onSubmit={(value)=>onInputChange("Type", value, i)} />
                <InputDropdown className="clone-budget-modal-form-input-text clone-budget-modal-form-input-text-group" type="text" name={`clone-budget-${i+1}-group`} value={budgetCycleBudget.Group || ""} items={groups} onChange={(value)=>onInputChange("Group", value, i)} onSubmit={(value)=>onInputChange("Group", value, i)} />
                <input className="clone-budget-modal-form-input-text clone-budget-modal-form-input-text-duedate" type="hidden" name={`clone-budget-${i+1}-duedate`} value={budgetCycleBudget.DueDate || ""} onChange={(event)=>onInputChange("DueDate", event.target.value, i)} />
                <input className="clone-budget-modal-form-input-text clone-budget-modal-form-input-text-Ispaidbycreditcardnotaccount" type="hidden" name={`clone-budget-${i+1}-Ispaidbycreditcardnotaccount`} value={!(budgetCycleBudget.IsPaidByCreditCardNotAccount === null || budgetCycleBudget.IsPaidByCreditCardNotAccount === undefined) && budgetCycleBudget.IsPaidByCreditCardNotAccount.toString() || ""} onChange={(event)=>onInputChange("IsPaidByCreditCardNotAccount", event.target.value, i)} />
                <input className="clone-budget-modal-form-input-text clone-budget-modal-form-input-text-budgetcycle" type="hidden" name={`clone-budget-${i+1}-budgetcycle`} value={budgetCycle || ""} />
                <button className="clone-budget-modal-form-delete-button" type="button" onClick={event=>onInputGroupMouseDeleteButtonClick(i)}>
                  <i className="clone-budget-modal-form-delete-button-icon fas fa-times"></i>
                </button>
              </div>
            ))}
          </div>
          <button type="button" className="clone-budget-modal-form-add-button btn btn-primary" onClick={onAddButtonClick}>
            <i className="clone-budget-modal-form-delete-button-icon fas fa-plus"></i>
            &nbsp;Add Budget
          </button>
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

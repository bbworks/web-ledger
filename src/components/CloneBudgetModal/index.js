import {useState, useEffect} from 'react';

import TransactionDetailModalInput from './../TransactionDetailModalInput';
import InputDropdown from './../InputDropdown';
import Modal from 'react-bootstrap/Modal';

import {getBudgetCycleString, getBudgetCycleFromBudgetCycleString, convertNumberToCurrency, convertCurrencyToNumber} from './../../utilities';
import {useBudgetCycleBudgets} from './../../hooks';

import './index.scss';

const CloneBudgetModal = ({ budgetCycle, budgetsData, types, groups, allBudgetCycles, isOpen, onClose, onSubmit:onSubmitProp })=>{
  //Create helper functions
  const getPreviousBudgetCycle = (allBudgetCycles, budgetCycle)=>{
    if (!budgetCycle) return;
    const allBudgetCyclesSorted = allBudgetCycles.sort((a,b)=>b.getTime()-a.getTime());
    const previousBudgetCycle = allBudgetCyclesSorted.find((b, i)=>(i===0 ? false : allBudgetCyclesSorted[i-1].getTime() === budgetCycle.getTime()));
    if (previousBudgetCycle) return previousBudgetCycle;
    return allBudgetCyclesSorted.find(b=>b.getTime() < budgetCycle.getTime());
  };

  const filterPreviousBudgetCycleBudgetsToClone = previousBudgetCycleBudgets=>{
    return previousBudgetCycleBudgets.filter(b=>!(b.DuePeriod !== "Monthly" && b.DueNext.getTime() !== budgetCycle.getTime()))
  };

  //Set state
  const [previousBudgetCycle, setPreviousBudgetCycle] = useState(getPreviousBudgetCycle(allBudgetCycles, budgetCycle));

  const previousBudgetCycleBudgets = useBudgetCycleBudgets(budgetsData, previousBudgetCycle);

  const [previousBudgetCycleBudgetsToClone, setPreviousBudgetCycleBudgetsToClone] = useState(filterPreviousBudgetCycleBudgetsToClone(previousBudgetCycleBudgets));

  const [isBillOptionsOpen, setIsBillOptionsOpen] = useState(false);

  const inputOptions = [
    {name: "BudgetCycle", placeholder: "Select a budget cycle", value: getBudgetCycleString(previousBudgetCycle), items: allBudgetCycles.map(b=>getBudgetCycleString(b)), tag: "input", tagType: "text", setState: setPreviousBudgetCycle, disabled: false},
  ];


  //Create functions
  const onPreviousBudgetCycleChange = (value, inputOption)=>{
    return inputOption.setState(getBudgetCycleFromBudgetCycleString(value));
  };

  const onPreviousBudgetCycleSubmit = (value, inputOption)=>{
    return inputOption.setState(getBudgetCycleFromBudgetCycleString(value));
  };

  const onInputChange = (name, value, i)=>{
    console.log(name, value, i);
    setPreviousBudgetCycleBudgetsToClone(previousBudgetCycleBudgetsToClone=>[
      ...previousBudgetCycleBudgetsToClone.slice(0,i),
      {
        ...previousBudgetCycleBudgetsToClone[i],
        [name]: value,
      },
      ...previousBudgetCycleBudgetsToClone.slice(i+1),
    ]);
  };

  const onSubmit = event=>{
    event.preventDefault();

    const now = new Date();

    //Vaildate the state values into an array of objects,
    // with updated DateCreated, DateModified values
    const value = previousBudgetCycleBudgetsToClone.map(e=>({
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
    setPreviousBudgetCycleBudgetsToClone(previousBudgetCycleBudgetsToClone=>[
      ...previousBudgetCycleBudgetsToClone.slice(0, index),
      ...previousBudgetCycleBudgetsToClone.slice(index+1),
    ]);
  };

  const onAddButtonClick = ()=>{
    setPreviousBudgetCycleBudgetsToClone(previousBudgetCycleBudgetsToClone=>[
      ...previousBudgetCycleBudgetsToClone,
      {
        Name: null,
        Amount: null,
        Type: null,
        Group: null,
        DueCycle: null,
        DueDate: null,
        IsPaidByCreditCardNotAccount: null,
        BudgetCycle: null,
        DateCreated: null,
        DateModified: null,
      },
    ]);
  };


  //Whenever previousBudgetCycleBudgets gets updated,
  // update the previousBudgetCycleBudgetsToClone
  useEffect(()=>{
    setPreviousBudgetCycleBudgetsToClone(filterPreviousBudgetCycleBudgetsToClone(previousBudgetCycleBudgets));
  }, [previousBudgetCycleBudgets]);

  //Whenever budgetCycle gets updated,
  // update the previousBudgetCycle
  useEffect(()=>{
    setPreviousBudgetCycle(getPreviousBudgetCycle(allBudgetCycles, budgetCycle));
  }, [allBudgetCycles, budgetCycle]);


  return (
    <Modal id="clone-budget-modal" className="clone-budget-modal" show={isOpen} onHide={onClose}>
      <Modal.Header>
        <Modal.Title className="modal-title">Clone Budget - {getBudgetCycleString(budgetCycle)}</Modal.Title>
        <button className="btn-close" type="button" onClick={onClose}></button>
      </Modal.Header>
      <form className="clone-budget-modal-form" onSubmit={onSubmit}>
        <Modal.Body>
          <div className="clone-budget-modal-heading">
            <label className="clone-budget-modal-heading-label">Clone from:</label>
            {
              inputOptions.map((inputOption, i)=>(
                <TransactionDetailModalInput key={inputOption.name} transactionDetail={inputOption} tabIndex={i+1} onChange={(value)=>onPreviousBudgetCycleChange(value, inputOption)} onInputDropdownSubmit={(value)=>onPreviousBudgetCycleSubmit(value, inputOption)} />
              ))
            }
          </div>
          <div>
            {previousBudgetCycleBudgetsToClone.map((budgetCycleBudget, i)=>(
              <div key={i} className="clone-budget-modal-form-input-group">
                <input className="clone-budget-modal-form-input-text clone-budget-modal-form-input-text-name" type="text" name={`clone-budget-${i+1}-name`} value={budgetCycleBudget.Name || ""} onChange={(event)=>onInputChange("Name", event.target.value, i)} />
                <input className="clone-budget-modal-form-input-text clone-budget-modal-form-input-text-amount" type="text" name={`clone-budget-${i+1}-amount`} value={(!isNaN(Number(budgetCycleBudget.Amount)) ? convertNumberToCurrency(budgetCycleBudget.Amount) : budgetCycleBudget.Amount) || ""} onChange={(event)=>onInputChange("Amount", event.target.value, i)} />
                <InputDropdown className="clone-budget-modal-form-input-text clone-budget-modal-form-input-text-type" type="text" name={`clone-budget-${i+1}-type`} value={budgetCycleBudget.Type || ""} items={types} onChange={(value)=>onInputChange("Type", value, i)} onSubmit={(value)=>onInputChange("Type", value, i)} />
                <InputDropdown className="clone-budget-modal-form-input-text clone-budget-modal-form-input-text-group" type="text" name={`clone-budget-${i+1}-group`} value={budgetCycleBudget.Group || ""} items={groups} onChange={(value)=>onInputChange("Group", value, i)} onSubmit={(value)=>onInputChange("Group", value, i)} />
                <input className="clone-budget-modal-form-input-text clone-budget-modal-form-input-text-duecycle" type="hidden" name={`clone-budget-${i+1}-duecycle`} value={budgetCycleBudget.DueCycle || ""} onChange={(event)=>onInputChange("DueCycle", event.target.value, i)} />
                <input className="clone-budget-modal-form-input-text clone-budget-modal-form-input-text-duedate" type="hidden" name={`clone-budget-${i+1}-duedate`} value={budgetCycleBudget.DueDate || ""} onChange={(event)=>onInputChange("DueDate", event.target.value, i)} />
                <input className="clone-budget-modal-form-input-text clone-budget-modal-form-input-text-Ispaidbycreditcardnotaccount" type="hidden" name={`clone-budget-${i+1}-Ispaidbycreditcardnotaccount`} value={!(budgetCycleBudget.IsPaidByCreditCardNotAccount === null || budgetCycleBudget.IsPaidByCreditCardNotAccount === undefined) && budgetCycleBudget.IsPaidByCreditCardNotAccount.toString() || ""} onChange={(event)=>onInputChange("IsPaidByCreditCardNotAccount", event.target.value, i)} />
                <input className="clone-budget-modal-form-input-text clone-budget-modal-form-input-text-budgetcycle" type="hidden" name={`clone-budget-${i+1}-budgetcycle`} value={budgetCycle || ""} />
                <button className="clone-budget-modal-form-delete-button" type="button" onClick={event=>onInputGroupMouseDeleteButtonClick(i)}>
                  <i className="clone-budget-modal-form-delete-button-icon fas fa-times"></i>
                </button>
                {budgetCycleBudget.DuePeriod === "Monthly" ? '' : <div class="clone-budget-modal-form-label-due-period">{budgetCycleBudget.DuePeriod} | {getBudgetCycleString(budgetCycleBudget.BudgetCycle)} - {getBudgetCycleString(budgetCycleBudget.DueNext)}</div>}
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

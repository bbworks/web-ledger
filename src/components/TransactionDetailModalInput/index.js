import TagBadge from './../TagBadge';
import InputDropdown from './../InputDropdown';
import MonthPicker from './../MonthPicker';

import {getBudgetCycleString, getBudgetCycleFromBudgetCycleString} from './../../utilities';

import './index.scss';

const TransactionDetailModalInput = ({ transactionDetail, tabIndex, onChange:onChangeProp, onKeyPress, onTagBadgeClick})=>{
  const onChange = value=>{
    if(onChangeProp) onChangeProp(value);
    return;
  };

  if (transactionDetail.name === "Tags")
    return (
      <div>
        <div className="transaction-detail-modal-input-tags-container form-control">
          <input className="transaction-detail-modal-input-tags-hidden form-control" type="hidden" name="Tags" value={transactionDetail.value.join(",")} />
          <div className="transaction-detail-modal-input-tags-badge-container">
            {transactionDetail.value.map(tag=><TagBadge key={tag} tag={tag} onClick={event=>onTagBadgeClick(tag)} />)}
          </div>
          <transactionDetail.tag className="transaction-detail-modal-input transaction-detail-modal-input-tags form-control" type={transactionDetail.tagType} placeholder={transactionDetail.placeholder} tabIndex={tabIndex} onKeyPress={onKeyPress}></transactionDetail.tag>
        </div>
      </div>
    );

  if (transactionDetail.name === "BudgetCycle")
    return (
      <div className="position-relative d-flex align-items-stretch">
        <InputDropdown name={transactionDetail.name} value={transactionDetail.value} items={transactionDetail.items} placeholder={transactionDetail.placeholder} {...(transactionDetail.disabled && {disabled: true})} tabIndex={tabIndex} onInputDropdownInputChange={event=>onChange(event.target.value)} onInputDropdownInputKeyPress={onKeyPress}/>
        <MonthPicker value={getBudgetCycleFromBudgetCycleString(transactionDetail.value)} onChange={value=>onChange(getBudgetCycleString(value))}/>
      </div>
    );

  if (["Category", "Type", "BudgetCycle"].includes(transactionDetail.name))
    return (
      <div>
        <InputDropdown name={transactionDetail.name} value={transactionDetail.value} items={transactionDetail.items} placeholder={transactionDetail.placeholder} {...(transactionDetail.disabled && {disabled: true})} tabIndex={tabIndex} onInputDropdownInputChange={event=>onChange(event.target.value)} onInputDropdownInputKeyPress={onKeyPress}/>
      </div>
    );

  return (
    <div>
      <transactionDetail.tag className="transaction-detail-modal-input transaction-detail-modal-input-text form-control" name={transactionDetail.name} value={transactionDetail.value} type={transactionDetail.tagType} placeholder={transactionDetail.placeholder} tabIndex={tabIndex} {...(transactionDetail.disabled && {disabled: true})} onChange={event=>onChange(event.target.value)} onKeyPress={onKeyPress}>{transactionDetail.tag !== "input" ? transactionDetail.value : null}</transactionDetail.tag>
    </div> //disabled inputs don't fire events; wrap in something that will fire an event
  );
};

export default TransactionDetailModalInput;

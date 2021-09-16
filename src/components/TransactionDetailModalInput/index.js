import TagBadge from './../TagBadge';
import InputDropdown from './../InputDropdown';

import './index.scss';

const TransactionDetailModalInput = ({ transactionDetail, tabIndex, onChange, onKeyPress, onTagBadgeClick })=>{
  return (
    <div>
      {(
        transactionDetail.name === "Tags" ?
        (
          <div className="transaction-detail-modal-input-tags-container form-control">
            <input className="transaction-detail-modal-input-tags-hidden form-control" type="hidden" name="Tags" value={transactionDetail.value.join(",")} />
            <div className="transaction-detail-modal-input-tags-badge-container">
              {transactionDetail.value.map(tag=><TagBadge key={tag} tag={tag} onClick={event=>onTagBadgeClick(tag)} />)}
            </div>
            <transactionDetail.tag className="transaction-detail-modal-input transaction-detail-modal-input-tags form-control" type={transactionDetail.tagType} placeholder={transactionDetail.placeholder} tabIndex={tabIndex} onKeyPress={onKeyPress}></transactionDetail.tag>
          </div>
        ) : (
        ["Category", "Type", "BudgetCycle"].includes(transactionDetail.name) ?
          <InputDropdown name={transactionDetail.name} value={transactionDetail.value} items={transactionDetail.items} placeholder={transactionDetail.placeholder} {...(transactionDetail.disabled && {disabled: true})} tabIndex={tabIndex} onInputDropdownInputChange={onChange} onInputDropdownInputKeyPress={onKeyPress}/>
        :
          <transactionDetail.tag className="transaction-detail-modal-input transaction-detail-modal-input-text form-control" name={transactionDetail.name} value={transactionDetail.value} type={transactionDetail.tagType} placeholder={transactionDetail.placeholder} tabIndex={tabIndex} {...(transactionDetail.disabled && {disabled: true})} onChange={onChange} onKeyPress={onKeyPress}>{transactionDetail.tag !== "input" ? transactionDetail.value : null}</transactionDetail.tag>
      )
    )}
    </div> //disabled inputs don't fire events; wrap in something that will fire an event
  );
};

export default TransactionDetailModalInput;

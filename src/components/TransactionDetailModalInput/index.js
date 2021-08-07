import TagBadge from './../TagBadge';
import InputDropdown from './../InputDropdown';

import './index.scss';

const TransactionDetailModalInput = ({ transactionDetail, tabIndex, onClick, onBlur, onChange, onKeyDown, onTagBadgeClick })=>{
  return (
    <div key={`${transactionDetail.name}-container`} onClick={onClick} onBlur={onBlur}>
      {(
        transactionDetail.name === "Tags" ?
        (
          <div className="transaction-modal-input-tags-container form-control">
            <input className="transaction-modal-input-tags-hidden form-control" type="hidden" name="Tags" value={transactionDetail.value.join(",")} />
            <div className="transaction-modal-input-tags-badge-container">
              {transactionDetail.value.map(tag=><TagBadge key={tag} tag={tag} onClick={event=>onTagBadgeClick(tag)} />)}
            </div>
            <transactionDetail.tag className="transaction-modal-input transaction-modal-input-tags form-control" type={transactionDetail.tagType} placeholder={transactionDetail.placeholder} tabIndex={tabIndex} onKeyDown={onKeyDown}></transactionDetail.tag>
          </div>
        ) : (
        ["Category", "Type"].includes(transactionDetail.name) ?
          <InputDropdown name={transactionDetail.name} value={transactionDetail.value} items={transactionDetail.items} placeholder={transactionDetail.placeholder} disabled tabIndex={tabIndex} onKeyDown={onKeyDown} onChange={onChange}/>
        :
          <transactionDetail.tag className="transaction-modal-input transaction-modal-input-text form-control" name={transactionDetail.name} value={transactionDetail.value} type={transactionDetail.tagType} placeholder={transactionDetail.placeholder} tabIndex={tabIndex} disabled {...(transactionDetail.disabled && {"data-stay-disabled": true})} onKeyDown={onKeyDown} onChange={onChange}>{transactionDetail.tag !== "input" ? transactionDetail.value : null}</transactionDetail.tag>
      )
    )}
    </div> //disabled inputs don't fire events; wrap in something that will fire an event
  );
};

export default TransactionDetailModalInput;

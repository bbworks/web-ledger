import TagBadge from './../TagBadge';
import InputDropdown from './../InputDropdown';

import './index.scss';

const TransactionDetailModalInput = ({ transactionDetail, tabIndex, onClick, onBlur, onChange, onKeyDown, onTagBadgeClick })=>{
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
        transactionDetail.name === "Category" ?
          <InputDropdown name={transactionDetail.name} value={transactionDetail.value} items={categories} placeholder={transactionDetail.placeholder} disabled tabIndex={tabIndex} onKeyDown={onKeyDown} onChange={onChange}/>
        :
          <transactionDetail.tag className="transaction-modal-input transaction-modal-input-text form-control" name={transactionDetail.name} value={transactionDetail.value} type={transactionDetail.tagType} placeholder={transactionDetail.placeholder} tabIndex={tabIndex} disabled onKeyDown={onKeyDown} onChange={onChange}>{transactionDetail.tag !== "input" ? transactionDetail.value : null}</transactionDetail.tag>
      )
    )}
    </div> //disabled inputs don't fire events; wrap in something that will fire an event
  );
};

export default TransactionDetailModalInput;

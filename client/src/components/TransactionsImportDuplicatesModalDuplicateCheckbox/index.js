import {convertNumberToCurrency} from './../../utilities';

import './index.scss';

const TransactionsImportDuplicatesModalDuplicateCheckbox = ({ id, duplicateData, onChange:onChangeProp })=>{
  const onChange = event=>{
    //Update the duplicate's confirmation state in the parent
    const updatedDuplicateData = {
      ...duplicateData,
      confirmed: !duplicateData.confirmed,
    };

    onChangeProp(duplicateData, updatedDuplicateData);
  };

  return (
    <div className="form-check">
      <input className="form-check-input" type="checkbox" id={id} checked={duplicateData.confirmed} onChange={onChange}/>
      <label className="form-check-label" htmlFor={id}>
        {`${(duplicateData.duplicate.TransactionDate).toLocaleDateString("en-US", {timeZone: "UTC"})} ${convertNumberToCurrency(duplicateData.duplicate.Amount)} ${duplicateData.duplicate.Description}`}
      </label>
    </div>
  );
};

export default TransactionsImportDuplicatesModalDuplicateCheckbox;

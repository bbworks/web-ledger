import {useState} from 'react';

import './index.scss';

const TransactionsImportForm = ({ onSubmit:onSubmitProp, onFileInputChange:onFileInputChangeProp })=>{
  const [isOpen, setIsOpen] = useState(false);

  const toggleOnClick = event=>{
    setIsOpen(wasOpen=>!wasOpen);
  };

  const onSubmit = event=>{
    //Prevent form submission
    event.preventDefault();

    const transactionImportInput = event.target.querySelector("#transaction-import-input");

    //Get the transactions data
    const scrapedTransactionsData = transactionImportInput.value;

    //Reset the input
    transactionImportInput.value = '';

    //Re-close the form
    setIsOpen(false);

    //Send it to the parent
    onSubmitProp(scrapedTransactionsData);
  };

  const onFileInputChange = async event=>{
    //Prevent default behavior
    event.preventDefault();

    //Get the transactions data
    const transactionsDataArray = [];
    await Promise.all(  //Promise.all handles an array of Promises
      [...event.target.files].map(async file=>{
        const fileContent = await file.text();
        transactionsDataArray.push(fileContent);
      })
    );

    //Reset the file input
    event.target.value = "";

    //Re-close the form
    setIsOpen(false);

    //Call the parent handler
    onFileInputChangeProp(transactionsDataArray);
  };

  return (
    <div>
      <div className="d-flex justify-content-end">
        <button className="transaction-import-form-toggle btn btn-dark" type="button" onClick={toggleOnClick}>Import Transactions</button>
      </div>
      {(
        !isOpen ? null :
        <form id="transaction-import-form" className="transaction-import-form mb-4" onSubmit={onSubmit}>
          <div>
            <label className="form-label">Transactions</label>
            <div className="input-group mb-2">
              <textarea id="transaction-import-input" className="transaction-import-input form-control" rows="1"></textarea>
              <button className="btn btn-primary input-group-text" type="submit">Import</button>
            </div>
            <p className="form-text">Paste transactions data for parsing.</p>
            <div>
              <label className="form-label">Or, import a comma-separated values (*.csv) file.</label>
              <input id="transaction-import-form-input-file" className="form-control" type="file" accept=".csv" multiple onChange={onFileInputChange} />
            </div>
            <div id="transaction-import-form-status"></div>
          </div>
        </form>
      )}
    </div>
  );
};

export default TransactionsImportForm;

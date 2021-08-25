import {useState} from 'react';

import './index.scss';

const TransactionsImportForm = ({ isOpen, onSubmit:onSubmitProp, onFileInputChange:onFileInputChangeProp })=>{
  const [scrapedTransactionsData, setScrapedTransactionsData] = useState("");

  const onTransactionsImportFormInputChange = event=>{
    const scrapedText = event.target.value;
    setScrapedTransactionsData(scrapedText);
  };

  const onTransactionsImportFormFileInputChange = async event=>{
    //Prevent default behavior
    event.preventDefault();

    const transactionsDataFiles = [...event.target.files];

    //Get the transactions data
    const transactionsDataArray = [];
    await Promise.all(  //Promise.all handles an array of Promises
      transactionsDataFiles.map(async file=>{
        const fileContent = await file.text();
        transactionsDataArray.push(fileContent);
      })
    );

    //Reset the file input
    event.target.value = "";

    //Call the parent handler
    onFileInputChangeProp(transactionsDataArray);
  };

  const onSubmit = event=>{
    //Prevent form submission
    event.preventDefault();

    //Save the current value
    const scrapedTransactionsDataValue = scrapedTransactionsData;

    //Reset the input
    setScrapedTransactionsData("");

    //Send it to the parent
    onSubmitProp(scrapedTransactionsDataValue);
  };

  return (
    !isOpen ?
    null :
    <form className="transaction-import-form mb-4" onSubmit={onSubmit}>
      <div>
        <label className="form-label">Transactions</label>
        <div className="input-group mb-2">
          <textarea id="transaction-import-input" className="transaction-import-input form-control" rows="1" onChange={onTransactionsImportFormInputChange}></textarea>
          <button className="btn btn-primary input-group-text" type="submit">Import</button>
        </div>
        <p className="form-text">Paste transactions data for parsing.</p>
        <div>
          <label className="form-label">Or, import a comma-separated values (*.csv) file.</label>
          <input className="transaction-import-form-input-file form-control" type="file" accept=".csv" multiple onChange={onTransactionsImportFormFileInputChange} />
        </div>
        <div id="transaction-import-form-status"></div>
      </div>
    </form>
  );
};

export default TransactionsImportForm;

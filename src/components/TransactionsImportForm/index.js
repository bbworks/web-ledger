const TransactionsImportForm = ({ onSubmit:onSubmitProp, onFileInputChange:onFileInputChangeProp })=>{
  const onSubmit = event=>{
    //Prevent form submission
    event.preventDefault();

    const transactionImportInput = event.target.querySelector("#transaction-import-input");

    //Get the transactions data
    const scrapedTransactionsData = transactionImportInput.value;

    //Reset the input
    transactionImportInput.value = '';

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

    //Call the parent handler
    onFileInputChangeProp(transactionsDataArray);
  };

  return (
    <form id="transaction-import-form" className="transaction-import-form mb-4" onSubmit={onSubmit}>
      <div>
        <label className="form-label">Transactions</label>
        <div className="input-group mb-2">
          <input id="transaction-import-input" className="form-control" type="text" />
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
  );
};

export default TransactionsImportForm;

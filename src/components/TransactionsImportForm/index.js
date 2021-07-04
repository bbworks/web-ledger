const TransactionsImportForm = ({ onSubmit, onImportFormSubmit, onFileInputChange })=>{
  return (
    <form id="transaction-import-form" className="transaction-import-form mb-4" onSubmit={onImportFormSubmit}>
      <div>
        <label className="form-label">Transactions</label>
        <div className="input-group mb-2">
          <input id="transaction-import-input" className="form-control" type="text" />
          <button className="btn btn-primary input-group-text" type="submit">Import</button>
        </div>
        <p className="form-text">Paste transaction data for parsing.</p>
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

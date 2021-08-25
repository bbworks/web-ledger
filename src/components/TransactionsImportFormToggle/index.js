import './index.scss';

const TransactionsImportFormToggle = ({ onClick })=>{
  return (
    <div className="transaction-import-form-toggle bg-primary d-flex justify-content-center align-items-center" onClick={onClick}>
      <i className="transaction-import-form-toggle-icon">+</i>
    </div>
  );
};

export default TransactionsImportFormToggle;

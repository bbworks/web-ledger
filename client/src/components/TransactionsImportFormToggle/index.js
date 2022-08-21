import './index.scss';

const TransactionsImportFormToggle = ({ onClick })=>{
  return (
    <div className="transaction-import-form-toggle bg-primary d-flex justify-content-center align-items-center" onClick={onClick}>
      <span className="transaction-import-form-toggle-icon">+</span>
    </div>
  );
};

export default TransactionsImportFormToggle;

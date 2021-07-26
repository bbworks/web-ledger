import './index.scss';

const TransactionsTableHeaders = ()=>{
  const headers = [
    "Transaction Date",
    "Account",
    "Category",
    "Description",
    "Notes",
    "Amount",
    "Tags",
    ""
  ];

  return (
    <thead>
      <tr>
        {headers.map(header=><th key={header}>{header}</th>)}
      </tr>
    </thead>
  );
};

export default TransactionsTableHeaders;

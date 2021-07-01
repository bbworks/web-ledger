import './index.scss';

const TransactionTableHeaders = ()=>{
  const headers = [
    "Posted Date",
    "Transaction Date",
    "Type",
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

export default TransactionTableHeaders;

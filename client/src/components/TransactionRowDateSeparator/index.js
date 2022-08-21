import {convertDateToFullLocaleDateString} from './../../utilities';

import './index.scss';

const TransactionRowDateSeparator = ({ date, count })=>{
  return (
    <div key={date.getTime()} className="transaction-row-date-separator d-flex justify-content-between p-1 px-3">
      <div>{convertDateToFullLocaleDateString(date)}</div>
      <div>({count})</div>
    </div>
  );
};

export default TransactionRowDateSeparator;

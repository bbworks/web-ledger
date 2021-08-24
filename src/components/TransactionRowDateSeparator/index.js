import {useState, useEffect} from 'react';

import './index.scss';

const TransactionRowDateSeparator = ({ date, count })=>{
  const getMonthString = monthIndex=>{
    if (monthIndex === 0) return "January";
    if (monthIndex === 1) return "February";
    if (monthIndex === 2) return "March";
    if (monthIndex === 3) return "April";
    if (monthIndex === 4) return "May";
    if (monthIndex === 5) return "June";
    if (monthIndex === 6) return "July";
    if (monthIndex === 7) return "August";
    if (monthIndex === 8) return "September";
    if (monthIndex === 9) return "October";
    if (monthIndex === 10) return "November";
    if (monthIndex === 11) return "December";
    return null
  };

  const convertDateToDateHeaderString = date=>{
    return `${getMonthString(date.getMonth())} ${date.getDate()}, ${date.getFullYear()}`;
  };

  return (
    <div key={date.getMilliseconds()} className="transaction-row-date-separator d-flex justify-content-between p-1 px-3">
      <div>{convertDateToDateHeaderString(date)}</div>
      <div>({count})</div>
    </div>
  );
};

export default TransactionRowDateSeparator;

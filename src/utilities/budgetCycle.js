export const getMonthFromNumber = number=>{
  if (number === 0) return "January";
  if (number === 1) return "February";
  if (number === 2) return "March";
  if (number === 3) return "April";
  if (number === 4) return "May";
  if (number === 5) return "June";
  if (number === 6) return "July";
  if (number === 7) return "August";
  if (number === 8) return "September";
  if (number === 9) return "October";
  if (number === 10) return "November";
  if (number === 11) return "December";
  return null;
};

export const getNumberFromMonth = month=>{
  switch (month) {
    case "January":
      return 0;
    case "February":
      return 1;
    case "March":
      return 2;
    case "April":
      return 3;
    case "May":
      return 4;
    case "June":
      return 5;
    case "July":
      return 6;
    case "August":
      return 7;
    case "September":
      return 8;
    case "October":
      return 9;
    case "November":
      return 10;
    case "December":
      return 11;
  }
  return null;
};

export const getBudgetCycleFromDate = date=>{
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth()));
};

export const getBudgetCycleString = budgetCycle=>{
  return `${getMonthFromNumber(budgetCycle.getUTCMonth())} ${budgetCycle.getUTCFullYear()}`;
};

export const convertDateToFullLocaleDateString = date=>{
  return `${getMonthFromNumber(date.getUTCMonth())} ${date.getUTCDate()}, ${date.getUTCFullYear()}`;
};

export const getBudgetCycleFromBudgetCycleString = budgetCycleString=>{
  const [matches, monthString, yearString] = budgetCycleString.match(/(\w+) (\d{4})/);
  const year = Number(yearString);
  const month = getNumberFromMonth(monthString);

  return new Date(Date.UTC(year, month));
};

export const getBudgetCycleDescription = (budgetCycle, todayBudgetCycle=(new Date()))=>{
  const fullYearDifference = todayBudgetCycle.getUTCFullYear() - budgetCycle.getUTCFullYear();
  const monthDifference = (fullYearDifference*12) + (todayBudgetCycle.getUTCMonth() - budgetCycle.getUTCMonth());
  if (monthDifference <= -12) return `${Math.abs(Math.floor(monthDifference/12))} year${Math.abs(Math.floor(monthDifference/12))===1?"":"s"} later`;
  if (monthDifference < -1) return `${Math.abs(Math.floor(monthDifference))} month${Math.abs(Math.floor(monthDifference))===1?"":"s"} later`;
  if (monthDifference === -1) return "next month";
  if (monthDifference === 0) return "current";
  if (monthDifference === 1) return "last month";
  if (monthDifference < 12) return `${monthDifference} month${monthDifference===1?"":"s"} ago`;
  const yearDifference = Math.floor(monthDifference/12);
  return `${yearDifference} year${yearDifference===1?"":"s"} ago`;
}

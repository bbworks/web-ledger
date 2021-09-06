export const getMonthFromNumber = number=>{
  switch (number) {
    case 0:
      return "January";
    case 1:
      return "February";
    case 2:
      return "March";
    case 3:
      return "April";
    case 4:
      return "May";
    case 5:
      return "June";
    case 6:
      return "July";
    case 7:
      return "August";
    case 8:
      return "September";
    case 9:
      return "October";
    case 10:
      return "November";
    case 11:
      return "December";
  }
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
  return new Date(date.getFullYear(), date.getMonth());
};

export const getBudgetCycleString = budgetCycle=>{
  return `${getMonthFromNumber(budgetCycle.getMonth())} ${budgetCycle.getFullYear()}`;
};

export const getBudgetCycleFromBudgetCycleString = budgetCycleString=>{
  const [matches, monthString, yearString] = budgetCycleString.match(/(\w+) (\d{4})/);
  const year = Number(yearString);
  const month = getNumberFromMonth(monthString);

  return new Date(year, month);
};

export const getBudgetCycleDescription = (budgetCycle, todayBudgetCycle=(new Date()))=>{
  const fullYearDifference = todayBudgetCycle.getFullYear() - budgetCycle.getFullYear();
  const monthDifference = (fullYearDifference*12) + (todayBudgetCycle.getMonth() - budgetCycle.getMonth());
  if (monthDifference < 0) return null;
  if (monthDifference === 0) return "current";
  if (monthDifference === 1) return "last month";
  if (monthDifference < 12) return `${monthDifference} month${monthDifference===1?"":"s"} ago`;
  const yearDifference = Math.floor(monthDifference/12);
  return `${yearDifference} year${yearDifference===1?"":"s"} ago`;
}

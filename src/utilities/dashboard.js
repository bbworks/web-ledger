export const getMonthFromNumber = number=>{
  switch (number) {
    case 0:
      return "January";
      break;
    case 1:
      return "February";
      break;
    case 2:
      return "March";
      break;
    case 3:
      return "April";
      break;
    case 4:
      return "May";
      break;
    case 5:
      return "June";
      break;
    case 6:
      return "July";
      break;
    case 7:
      return "August";
      break;
    case 8:
      return "September";
      break;
    case 9:
      return "October";
      break;
    case 10:
      return "November";
      break;
    case 11:
      return "December";
      break;
  }
  return null;
};

export const getBudgetCycleFromDate = date=>{
  return new Date(date.getFullYear(), date.getMonth());
};

export const getBudgetCycleString = budgetCycle=>{
  return `${getMonthFromNumber(budgetCycle.getMonth())} ${budgetCycle.getFullYear()}`;
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

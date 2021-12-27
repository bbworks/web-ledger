import {getMonthFromNumber, getNumberFromMonth, getBudgetCyclesFromTransactions} from './../utilities';

export const getBudgetCycleFromDate = date=>{
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth()));
};

const ALL_TRANSACTIONS_BUDGET_CYCLE = getBudgetCycleFromDate(new Date(8640000000000000)); //8640000000000000 (8.64e+15, max Date epoch)

export const getBudgetCycleFromBudgetCycleString = budgetCycleString=>{
  const [matches, monthString, yearString] = budgetCycleString.match(/(\w+) (\d{4})/);
  const year = Number(yearString);
  const month = getNumberFromMonth(monthString);

  return new Date(Date.UTC(year, month));
};

export const getBudgetCycleString = budgetCycle=>{
  //Short-circut for "All Transactions" budget cycle
  if (isAllTransactionsBudgetCycle(budgetCycle)) return "All Transactions";

  return `${getMonthFromNumber(budgetCycle.getUTCMonth())} ${budgetCycle.getUTCFullYear()}`;
};

export const getBudgetCycleDescription = (budgetCycle, todayBudgetCycle=(new Date()))=>{
  //Short-circut for "All Transactions" budget cycle
  if (isAllTransactionsBudgetCycle(budgetCycle)) return null;

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
};

export const getAllBudgetCycles = transactions=>{
  if (!transactions.length) return [];

  const todayBudgetCycle = getBudgetCycleFromDate(new Date());

  return [
    ...new Set([
      ALL_TRANSACTIONS_BUDGET_CYCLE,
      todayBudgetCycle, //assure the current month is an option as well
      ...getBudgetCyclesFromTransactions(transactions),
    ].map(date=>date.getTime()))
  ]
    .sort((a,b)=>b-a)
    .map(epochTime=>new Date(epochTime));
};

export const isAllTransactionsBudgetCycle = budgetCycle=>{
  return (!(budgetCycle instanceof Date) ? null : budgetCycle.getTime() === ALL_TRANSACTIONS_BUDGET_CYCLE.getTime());
};

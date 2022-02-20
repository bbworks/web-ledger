import {useState, useEffect} from 'react';

import {getBudgetCycleFromDate, isAllTransactionsBudgetCycle} from './../utilities';

const useBudgetCycleTransactions = (transactions, budgetCycle)=>{
  //Declare functions
  const isPaymentTransaction = transaction=>{
    return (
      transaction.Type === "Payment" ||
      transaction.Description.match(/CREDIT CARD PAYMENT (?:MOBILE APP PAYMENT|ONLINE BANKING TRANSFER) TO \d{4} \d{6}\*{6}(\d{4})/i) ||
      transaction.Description.match(/PAYMENT - \w{5} \w{3} \w{7} \w{2}/i)
    )
  };

  const isCorrespondingTransferTransaction = transaction=>{
    //Removes transactions that are transfers with corresponding credit/debit transfers in a different account
    return (
      transaction.Type==="Transfer" &&
      transactions.find(transaction2=>
        transaction.TransactionDate.getTime()===transaction2.TransactionDate.getTime() &&
        transaction.Amount===-transaction2.Amount &&
        transaction.DescriptionDisplay && transaction.DescriptionDisplay.match(/\*(\d{4})/)[1]===transaction2.AccountNumber && transaction2.AccountNumber.match(/\*(\d{4})/)[1] &&
        transaction.AccountNumber && transaction.AccountNumber.match(/\*(\d{4})/)[1]===transaction2.DescriptionDisplay && transaction2.DescriptionDisplay.match(/\*(\d{4})/)[1]
      )
    )
  };

  const isIncome = transaction=>{
    return ["Infor payroll", "Other income"].includes(transaction.Category);
  };

  const isIncomeTransaction = transaction=>{
    return transaction.Amount >= 0 && !isPaymentTransaction(transaction);
  };

  const isExpenseTransaction = transaction=>{
    return transaction.Amount < 0 && !isPaymentTransaction(transaction);
  };

  const getLastBudgetCycleIncomeTransactions = transactions=>{
    //Get income transactions from last budget cycle
    if (!transactions.length) return [];

    return transactions.filter(transaction=>isIncome(transaction));
  };

  const getCurrentBudgetCycleIncomeTransactions = transactions=>{
    //Get other income transactions from this budget cycle
    if (!transactions.length) return [];

    return transactions.filter(transaction=>!isIncome(transaction) && isIncomeTransaction(transaction));
  };

  const getCurrentBudgetCycleExpenseTransactions = transactions=>{
    //Get expense transactions from this budget cycle
    if (!transactions.length) return [];

    return transactions.filter(transaction=>!["Infor payroll", "Other income"].includes(transaction.Category) && isExpenseTransaction(transaction));
  };

  const getBudgetCycleTransactions = (transactions, budgetCycle)=>{
    //Get transactions marked with this budgetCycle
    // (or with a Date of this budget cycle, if no BudgetCycle)
    const currentBudgetCycleTransactions = (
      //If "All transactions", use all transactions, instead of current budgetCycleTransactions
      isAllTransactionsBudgetCycle(budgetCycle) ?
      transactions.filter(transaction=>
        //Remove corresponding credit/debit transfers
        !isCorrespondingTransferTransaction(transaction)
      ) :
      transactions.filter(transaction=>
        //Transactions with this budget cycle
        getBudgetCycleFromDate(transaction.BudgetCycle || transaction.TransactionDate).getTime() === budgetCycle.getTime()
        &&
        //Remove corresponding credit/debit transfers
        !isCorrespondingTransferTransaction(transaction)
      )
    );

    console.log(
      "useBudgetCycleTransactions filtered corresponding credit/debit transfers",
      transactions.filter(transaction=>getBudgetCycleFromDate(transaction.BudgetCycle || transaction.TransactionDate).getTime() === budgetCycle.getTime()
      &&
      //Remove payment transactions
      !(transaction.Type === "Payment")
      &&
      transaction.Type==="Transfer" && transactions.find(transaction2=>
        transaction.TransactionDate.getTime()===transaction2.TransactionDate.getTime() &&
        transaction.Amount===-transaction2.Amount &&
        transaction.DescriptionDisplay.match(/\*(\d{4})/)[1]===transaction2.AccountNumber.match(/\*(\d{4})/)[1] &&
        transaction.AccountNumber.match(/\*(\d{4})/)[1]===transaction2.DescriptionDisplay.match(/\*(\d{4})/)[1]
      ))
    );

    //Get last budget cycle's income
    const lastBudgetCycleIncomeTransactions = getLastBudgetCycleIncomeTransactions(currentBudgetCycleTransactions, budgetCycle);

    //Get this budget cycle's other income
    const currentBudgetCycleIncomeTransactions = getCurrentBudgetCycleIncomeTransactions(currentBudgetCycleTransactions, budgetCycle);

    //Get this month's transactions (minus income)
    const currentBudgetCycleExpenseTransactions = getCurrentBudgetCycleExpenseTransactions(currentBudgetCycleTransactions, budgetCycle);

    const budgetCycleTransactionsReturn = {
      income: [...lastBudgetCycleIncomeTransactions, ...currentBudgetCycleIncomeTransactions],
      expenses: currentBudgetCycleExpenseTransactions,
      get all() {return [...this.income, ...this.expenses].flat()},
    };

    console.log("budgetCycleTransactions", budgetCycleTransactionsReturn);

    return budgetCycleTransactionsReturn;
  };

  //Initialize state
  const [budgetCycleTransactions, setBudgetCycleTransactions] = useState(getBudgetCycleTransactions(transactions, budgetCycle));

  //Whenever transactions or budgetCycle changes,
  // update state
  useEffect(()=>
    setBudgetCycleTransactions(getBudgetCycleTransactions(transactions, budgetCycle))
  , [transactions, budgetCycle]);

  //Return the state
  return budgetCycleTransactions;
};

export default useBudgetCycleTransactions;

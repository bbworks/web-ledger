import {useState, useEffect} from 'react';

import {getBudgetCycleFromDate, isAllTransactionsBudgetCycle, isBudgetedIncomeTransaction} from './../utilities';

const useBudgetCycleTransactions = (transactions, budgetCycle, budgets)=>{
  //Declare functions
  const isTransactionWithinBudgetCycle = (transaction, budgetCycle)=>{
    return getBudgetCycleFromDate(transaction.BudgetCycle || transaction.TransactionDate).getTime() === budgetCycle.getTime();
  };
  
  const getTransactionsWithinBudgetCycleFromPrevious = (transactions, budgetCycle, budgets)=>{
    if (!budgets?.length) return [];
    const budgetsFromPreviousBudgetCycles = budgets.filter(b=>b.BudgetCycle.getTime() < budgetCycle.getTime() && b.DueNext?.getTime() > budgetCycle.getTime());
    return transactions.filter(t=>
      budgetsFromPreviousBudgetCycles.filter(previousBudget=>
        t.Budget === previousBudget.Name &&  // tranasactions for this Budget
        t.BudgetCycle.getTime() < budgetCycle.getTime() &&  // transactions that occurred before this budgetCycle
        t.BudgetCycle.getTime() < previousBudget.DueNext.getTime() &&  // transactions that occurred before the previous Budget is due
        t.BudgetCycle.getTime() >= previousBudget.BudgetCycle.getTime()  // transactions that occurred during or after the previous Budget
      ).length
    );
  };
  
  const isPaymentTransaction = transaction=>{
    return (
      transaction.Type === "Payment" ||
      transaction.Description.match(/(?:MOBILE TO \*{12}(\d{4}) )?CREDIT CARD PAYMENT(?: (?:MOBILE APP PAYMENT|ONLINE BANKING TRANSFER) TO \d{4} \d{6}\*{6}(\d{4}))?/i) ||
      transaction.Description.match(/PAYMENTS? - \w{5} \w{3}/i)
    )
  };

  const isTransferWithCorrespondingNegativeTransfer = transaction=>{
    //Removes transactions that are transfers with corresponding credit/debit transfers in a different account
    return (
      ["Transfer", "Deposit"].includes(transaction.Type) &&
      transactions.find(transaction2=>
        transaction.TransactionDate.getTime()===transaction2.TransactionDate.getTime() &&
        transaction.Amount===-transaction2.Amount &&
        (typeof transaction.DescriptionDisplay === "string" && transaction.DescriptionDisplay.match(/\*(\d{4})/)?.[1]) === (transaction2.AccountNumber && transaction2.AccountNumber.match(/\*(\d{4})/)?.[1]) &&
        (typeof transaction.AccountNumber === "string" && transaction.AccountNumber.match(/\*(\d{4})/)?.[1]) === (transaction2.DescriptionDisplay && transaction2.DescriptionDisplay.match(/\*(\d{4})/)?.[1])
      )
    )
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

    return transactions.filter(transaction=>isBudgetedIncomeTransaction(transaction));
  };

  const getCurrentBudgetCycleIncomeTransactions = transactions=>{
    //Get other income transactions from this budget cycle
    if (!transactions.length) return [];

    return transactions.filter(transaction=>!isBudgetedIncomeTransaction(transaction) && isIncomeTransaction(transaction));
  };

  const getCurrentBudgetCycleExpenseTransactions = transactions=>{
    //Get expense transactions from this budget cycle
    if (!transactions.length) return [];

    return transactions.filter(transaction=>!(transaction.Budget?.match(/payroll|^Other income$/i)) && isExpenseTransaction(transaction));
  };

  const getBudgetCycleTransactions = (transactions, budgetCycle, budgets)=>{
    //Get transactions marked with this budgetCycle
    // (or with a Date of this budget cycle, if no BudgetCycle)
    const currentBudgetCycleTransactions = (
      //If "All transactions", use all transactions, instead of current budgetCycleTransactions
      isAllTransactionsBudgetCycle(budgetCycle) ?
      transactions.filter(transaction=>
        //Remove corresponding credit/debit transfers
        !isTransferWithCorrespondingNegativeTransfer(transaction)
      ) :
      transactions.filter(transaction=>
        //Transactions with this budget cycle
        isTransactionWithinBudgetCycle(transaction, budgetCycle)
        &&
        //Remove corresponding credit/debit transfers
        !isTransferWithCorrespondingNegativeTransfer(transaction)
      )
    );

    console.log(
      "useBudgetCycleTransactions filtered corresponding credit/debit transfers",
      transactions.filter(transaction=>
        isTransactionWithinBudgetCycle(transaction, budgetCycle)
        &&
        //Remove payment transactions
        !(transaction.Type === "Payment")
        &&
        isTransferWithCorrespondingNegativeTransfer(transaction)
      )
    );

    //Get last budget cycle's income
    const lastBudgetCycleIncomeTransactions = getLastBudgetCycleIncomeTransactions(currentBudgetCycleTransactions, budgetCycle);

    //Get this budget cycle's other income
    const currentBudgetCycleIncomeTransactions = getCurrentBudgetCycleIncomeTransactions(currentBudgetCycleTransactions, budgetCycle);

    //Get this month's transactions (minus income)
    const currentBudgetCycleExpenseTransactions = getCurrentBudgetCycleExpenseTransactions(currentBudgetCycleTransactions, budgetCycle);

    //Get transactions that apply from previous months
    const previousBudgetCycleTransactions = getTransactionsWithinBudgetCycleFromPrevious(transactions, budgetCycle, budgets);

    const budgetCycleTransactionsReturn = {
      income: [...lastBudgetCycleIncomeTransactions, ...currentBudgetCycleIncomeTransactions],
      expenses: currentBudgetCycleExpenseTransactions,
      previous: previousBudgetCycleTransactions,
      get all() {return [...this.income, ...this.expenses].flat()},
    };

    console.log("budgetCycleTransactions", budgetCycleTransactionsReturn);

    return budgetCycleTransactionsReturn;
  };

  //Initialize state
  const [budgetCycleTransactions, setBudgetCycleTransactions] = useState(getBudgetCycleTransactions(transactions, budgetCycle, budgets));

  //Whenever transactions or budgetCycle changes,
  // update state
  useEffect(()=>
    setBudgetCycleTransactions(getBudgetCycleTransactions(transactions, budgetCycle, budgets))
  , [transactions, budgetCycle, budgets]);

  //Return the state
  return budgetCycleTransactions;
};

export default useBudgetCycleTransactions;

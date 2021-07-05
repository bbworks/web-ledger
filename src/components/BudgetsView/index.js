import BudgetGraph from './../BudgetGraph';

import {getBudgetAmountSpentFromTransactions} from './../../utilities.js';

import './index.scss';

const BudgetsView = ({ transactions, budgetsData })=>{
  console.log(transactions);

  return (
    <div className="view budgets-view container-fluid py-2">
      <div className="budget-graphs container">
        <h2 className="budgets-title text-center fw-bold">Month Overview</h2>

        {
          budgetsData.map(budgetData=>{
            const {name, amount, isSinglePaymentBill} = budgetData;
            return <BudgetGraph key={name} budget={{title: name, color: "#2196f3", budgetedAmount: amount, amountSpent: getBudgetAmountSpentFromTransactions(name, transactions), isSinglePaymentBill: isSinglePaymentBill}}/>
        })
        }
      </div>
    </div>
  );
};

export default BudgetsView;

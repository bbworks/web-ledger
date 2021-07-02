import BudgetGraph from './../BudgetGraph';

import './index.scss';

const BudgetsView = ()=>{
  return (
    <div className="view budgets-view container-fluid py-2">
      <h2 className="budgets-title text-center fw-bold">Month Overview</h2>

      <BudgetGraph budget={{title: "Groceries & Necessities", color: "green", budgetedAmount: 900, amountSpent: 123}}/>
      <BudgetGraph budget={{title: "Personal Spending", color: "red", budgetedAmount: 200, amountSpent: 201}}/>
    </div>
  );
};

export default BudgetsView;

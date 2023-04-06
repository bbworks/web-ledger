USE ldgr;

DROP VIEW IF EXISTS vwTransactionDetail;
CREATE VIEW vwTransactionDetail AS 
SELECT
      TransactionDetail.TransactionDetailId
    , TransactionDetail.TransactionId
    , BudgetCycle.BudgetCycle AS BudgetCycle
    , TransactionDetail.Amount 
    , Budget.Name AS Budget
    , TransactionDetail.Notes
    , TransactionDetail.date_created
    , TransactionDetail.created_by
    , TransactionDetail.date_modified
    , TransactionDetail.modified_by
    , TransactionDetail.UserId
FROM TransactionDetail
LEFT OUTER JOIN Budget
  ON Budget.BudgetId = TransactionDetail.BudgetId
LEFT OUTER JOIN BudgetCycle
  ON BudgetCycle.BudgetCycleId = Budget.BudgetCycleId
;

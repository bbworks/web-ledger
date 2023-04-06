USE ldgr;

DROP VIEW IF EXISTS vwTransactionMaster;
CREATE VIEW vwTransactionMaster AS 
SELECT
      TransactionMaster.TransactionId
    , TransactionMaster.TransactionDate
    , TransactionMaster.PostedDate
    , Account.AccountNumber
    , Type.Name
    , TransactionMaster.Description
    , TransactionMaster.DescriptionManual
    , TransactionMaster.DescriptionDisplay
    , BudgetCycle.BudgetCycle
    , TransactionMaster.IsAutoCategorized
    , TransactionMaster.IsUpdatedByUser
    , TransactionMaster.date_created
    , TransactionMaster.created_by
    , TransactionMaster.date_modified
    , TransactionMaster.modified_by
    , User.UserId
FROM TransactionMaster
LEFT OUTER JOIN Type
  ON Type.TypeId = TransactionMaster.TypeId
  AND Type.ResourceType = 'T'
LEFT OUTER JOIN BudgetCycle
  ON BudgetCycle.BudgetCycleId = TransactionMaster.BudgetCycleId
LEFT OUTER JOIN Account
  ON Account.AccountId = TransactionMaster.AccountId
LEFT OUTER JOIN User
	ON User.UserId = TransactionMaster.UserId
;

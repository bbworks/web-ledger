USE ldgr;

DROP VIEW IF EXISTS vwTransaction;
CREATE VIEW vwTransaction AS 
SELECT
      TransactionMaster.TransactionId
    , TransactionMaster.TransactionDate
    , TransactionMaster.PostedDate
    , Account.AccountNumber AS AccountNumber
    , Type.Name AS Type
    , TransactionMaster.Description
    , TransactionMaster.DescriptionManual
    , TransactionMaster.DescriptionDisplay
    , BudgetCycle.BudgetCycle AS BudgetCycle
    , TransactionMaster.IsAutoCategorized
    , TransactionMaster.IsUpdatedByUser
    , TransactionMaster.date_created
    , TransactionMaster.created_by
    , TransactionMaster.date_modified
    , TransactionMaster.modified_by
    , User.UserId AS User
    , TransactionDetail.TransactionDetailId
    , TransactionDetail.Amount
    , Budget.Name AS Category
    , TransactionDetail.Notes
    , (
		SELECT GROUP_CONCAT(Tag.Name SEPARATOR ',')
		FROM Tag
        INNER JOIN TransactionTag TransactionTag
			ON Tag.TagID = TransactionTag.TagId
		WHERE TransactionTag.TransactionId = TransactionMaster.TransactionId
	) AS Tags
    , TransactionDetail.date_created AS detail_date_created
    , TransactionDetail.created_by AS detail_created_by
    , TransactionDetail.date_modified AS detail_date_modified
    , TransactionDetail.modified_by AS detail_modified_by
    , User.UserId AS detail_User
FROM TransactionMaster
INNER JOIN TransactionDetail
	ON TransactionMaster.TransactionId = TransactionDetail.TransactionId
LEFT OUTER JOIN Type
  ON Type.TypeId = TransactionMaster.TypeId
  AND Type.ResourceType = 'T'
LEFT OUTER JOIN BudgetCycle
  ON BudgetCycle.BudgetCycleId = TransactionMaster.BudgetCycleId
LEFT OUTER JOIN Budget
    ON Budget.BudgetId = TransactionDetail.BudgetId
    AND Budget.BudgetCycleId = BudgetCycle.BudgetCycleId
LEFT OUTER JOIN Account
  ON Account.AccountId = TransactionMaster.AccountId
LEFT OUTER JOIN User
	ON User.UserId = TransactionMaster.UserId
LEFT OUTER JOIN User detailUser
	ON detailUser.UserId = TransactionDetail.UserId
GROUP BY 
  TransactionMaster.TransactionDate
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
  , TransactionDetail.TransactionDetailId
  , TransactionDetail.Amount
  , Budget.Name
  , TransactionDetail.Notes
;
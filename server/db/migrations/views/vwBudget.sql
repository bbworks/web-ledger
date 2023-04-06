USE ldgr;

DROP VIEW IF EXISTS vwBudget;
CREATE VIEW vwBudget AS 
SELECT
      Budget.BudgetId
      , Budget.Name
    , Budget.Amount
    , Type.Name AS Type
    , BudgetGroup.Name AS BudgetGroup
    , BudgetCycle.BudgetCycle AS BudgetCycle
    , Budget.DueDate
    , Budget.IsPaidByCreditCardNotAccount
    , Color.Value AS Color
    , Budget.date_created
    , Budget.created_by
    , Budget.date_modified
    , Budget.modified_by
    , User.UserId
FROM Budget
LEFT OUTER JOIN Type
  ON Type.TypeId = Budget.TypeId
  AND Type.ResourceType = 'B'
LEFT OUTER JOIN BudgetGroup
  ON BudgetGroup.BudgetGroupId = Budget.BudgetGroupId
LEFT OUTER JOIN BudgetCycle
  ON BudgetCycle.BudgetCycleId = Budget.BudgetCycleId
LEFT OUTER JOIN Color
  ON Color.ColorId = Budget.ColorId
LEFT OUTER JOIN User
	ON User.UserId = Budget.UserId
;

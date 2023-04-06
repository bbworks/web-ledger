USE ldgr;

DROP VIEW IF EXISTS vwAccount;
CREATE VIEW vwAccount AS 
SELECT 
      Account.AccountId
    , Account.AccountNumber
    , Account.Name
    , Bank.Name AS Bank
    , Color.Value AS Color
    , Type.Name AS Type
    , Account.date_created
    , Account.created_by
    , Account.date_modified
    , Account.modified_by
    , User.UserId
FROM Account
LEFT OUTER JOIN Type
	ON Type.TypeId = Account.TypeId
  AND Type.ResourceType = 'A'
LEFT OUTER JOIN Bank
	ON Bank.BankId = Account.BankId
LEFT OUTER JOIN Color
	ON Color.ColorId = Account.ColorId
LEFT OUTER JOIN User
	ON User.UserId = Account.UserId
ORDER BY 1;

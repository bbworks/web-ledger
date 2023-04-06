USE ldgr;

INSERT INTO `BudgetGroup` (`Name`, `TypeId`) 
WITH denormalized (Name, Type) AS (
    SELECT 'Income', 'income'
    UNION SELECT 'Housing', 'bill'
    UNION SELECT 'Food & Dining', 'bill'
    UNION SELECT 'Auto & Transportation', 'expense'
    UNION SELECT 'Utilities & Services', 'bill'
    UNION SELECT 'Subscriptions & Memberships', 'bill'
    UNION SELECT 'Loans', 'bill'
    UNION SELECT 'Children', 'expense'
    UNION SELECT 'Personal', 'expense'
    UNION SELECT 'Savings', 'savings'
    UNION SELECT 'Giving', 'giving'
    UNION SELECT 'Miscellaneous', 'expense'
)
SELECT
	denormalized.Name
    , Type.TypeId
FROM denormalized
LEFT OUTER JOIN Type
	ON Type.Name = denormalized.Type;
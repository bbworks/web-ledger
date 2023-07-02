USE ldgr;

DROP VIEW IF EXISTS vwRevisionHistory;
CREATE VIEW vwRevisionHistory AS 
WITH Revisions AS (
SELECT RevisionId, RevisionDate, Action, 'Account' AS TableName FROM History_Account
    UNION
SELECT RevisionId, RevisionDate, Action, 'Address' AS TableName FROM History_Address
    UNION
SELECT RevisionId, RevisionDate, Action, 'Bank' AS TableName FROM History_Bank
    UNION
SELECT RevisionId, RevisionDate, Action, 'Budget' AS TableName FROM History_Budget
    UNION
SELECT RevisionId, RevisionDate, Action, 'BudgetCycle' AS TableName FROM History_BudgetCycle
    UNION
SELECT RevisionId, RevisionDate, Action, 'BudgetGroup' AS TableName FROM History_BudgetGroup
    UNION
SELECT RevisionId, RevisionDate, Action, 'Color' AS TableName FROM History_Color
    UNION
SELECT RevisionId, RevisionDate, Action, 'Country' AS TableName FROM History_Country
    UNION
SELECT RevisionId, RevisionDate, Action, 'Login' AS TableName FROM History_Login
    UNION
SELECT RevisionId, RevisionDate, Action, 'LoginAttempt' AS TableName FROM History_LoginAttempt
    UNION
SELECT RevisionId, RevisionDate, Action, 'Password' AS TableName FROM History_Password
    UNION
SELECT RevisionId, RevisionDate, Action, 'State' AS TableName FROM History_State
    UNION
SELECT RevisionId, RevisionDate, Action, 'Tag' AS TableName FROM History_Tag
    UNION
SELECT RevisionId, RevisionDate, Action, 'TransactionDetail' AS TableName FROM History_TransactionDetail
    UNION
SELECT RevisionId, RevisionDate, Action, 'TransactionMaster' AS TableName FROM History_TransactionMaster
    UNION
SELECT RevisionId, RevisionDate, Action, 'TransactionTag' AS TableName FROM History_TransactionTag
    UNION
SELECT RevisionId, RevisionDate, Action, 'Type' AS TableName FROM History_Type
    UNION
SELECT RevisionId, RevisionDate, Action, 'User' AS TableName FROM History_User
    UNION
SELECT RevisionId, RevisionDate, Action, 'UserLogin' AS TableName FROM History_UserLogin
)
SELECT
	ROW_NUMBER() OVER (ORDER BY RevisionDate, RevisionId) AS RevisionHistoryId
    , RevisionId
    , RevisionDate
    , Action
    , TableName
FROM Revisions
ORDER BY RevisionHistoryId;

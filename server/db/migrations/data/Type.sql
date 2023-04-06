USE ldgr;

INSERT INTO `Type` (
	`Name`
    , `ResourceType`
)
VALUES
  ('charges', 'T')
, ('payments', 'T')
, ('debit', 'T')
, ('credit', 'T')
, ('withdrawal', 'T')
, ('deposit', 'T')
, ('transfer', 'T')
, ('payment', 'T')
, ('interest', 'T')
, ('ATM', 'T')
, ('check', 'T')
, ('checking', 'A')
, ('savings', 'A')
, ('credit card', 'A')
, ('income', 'B')
, ('bill', 'B')
, ('loan', 'B')
, ('expense', 'B')
, ('savings', 'B')
, ('giving', 'B')
;
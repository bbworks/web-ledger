DROP VIEW IF EXISTS vwAddress;
CREATE VIEW vwAddress AS 
SELECT
    Address.AddressId
  , Address.StreetAddress1
  , Address.StreetAddress2
  , Address.Building
  , Address.AptNumber
  , Address.City
  , Address.Zip
  , State.StateCode
  , State.Name AS StateName
  , Country.Alpha2Code
  , Country.CountryCode
  , Country.Name AS CountryName
  , Address.date_created
  , Address.created_by
  , Address.date_modified
  , Address.modified_by
  , Address.UserId
FROM Address
INNER JOIN State
  ON State.StateId = Address.StateId
INNER JOIN Country
  ON Country.CountryId = Address.CountryId
LEFT OUTER JOIN User
	ON User.UserId = Address.UserId
;

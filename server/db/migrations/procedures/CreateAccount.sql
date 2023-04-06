USE `ldgr`;

START TRANSACTION;

DROP PROCEDURE IF EXISTS `CreateAccount`;

DELIMITER ;;

CREATE PROCEDURE `CreateAccount` (
	  $AccountNumber  varchar(24)
	, $Name           varchar(50)
	, $Type           varchar(50)
	, $Bank           varchar(50)
	, $Color          char(7)
    , $date_created   datetime
    , $created_by     int
    , $date_modified  datetime
    , $modified_by    int
    , $UserId         int
)
BEGIN
	# Set default parameters
    SET $date_created = IFNULL($date_created, CURRENT_TIMESTAMP());
    SET $created_by = IFNULL($created_by, NULL);
    SET $date_modified = IFNULL($date_modified, CURRENT_TIMESTAMP());
    SET $modified_by = IFNULL($modified_by, NULL);
    SET $UserId = IFNULL($UserId, NULL);    


	# Validate the Type
	IF NOT EXISTS (
		SELECT 1 FROM Type WHERE Name = $Type AND ResourceType = 'A'
	)
	THEN
		SET @throw = CONCAT('Invalid Type "', IFNULL($Type, ''), '".');
		SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = @throw;
	END IF;

	# Validate the Color  # can be null
	IF $Color IS NOT NULL AND NOT EXISTS (
		SELECT 1 FROM Color WHERE Value = $Color
	)
	THEN
		SET @throw = CONCAT('Invalid Color "', IFNULL($Color, ''), '".');
		SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = @throw;
	END IF;

	# Validate the Bank
	IF NOT EXISTS (
		SELECT 1 FROM Bank WHERE Name = $Bank
	)
	THEN
		SET @throw = CONCAT('Invalid Bank "', IFNULL($Bank, ''), '".');
		SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = @throw;
	END IF;

	
	# Create the Account
	INSERT INTO `Account` (
		`AccountNumber`
		, `Name`
		, `TypeId`
		, `BankId`
		, `ColorId`
	)
	WITH denormalized AS (
		SELECT
			$AccountNumber AS AccountNumber
			, $Name AS Name
			, $Type AS Type
			, $Bank AS Bank
			, $Color AS Color
	)
	SELECT 
		  denormalized.AccountNumber
		, denormalized.Name
		, Type.TypeId
		, Bank.BankId
		, Color.ColorId
	FROM denormalized
	LEFT OUTER JOIN Type
		ON Type.Name = denormalized.Type
		AND Type.ResourceType = 'A'
	LEFT OUTER JOIN Bank
		ON Bank.Name = denormalized.Bank
	LEFT OUTER JOIN Color
		ON Color.Value = denormalized.Color
	LEFT OUTER JOIN Account
		ON Account.AccountNumber = denormalized.AccountNumber
		AND Account.Name = denormalized.Name
		AND Account.TypeId = Type.TypeId
		AND Account.BankId = Bank.BankId
	WHERE Account.AccountId IS NULL;

	SELECT LAST_INSERT_ID();
END ;;

DELIMITER ;

COMMIT;

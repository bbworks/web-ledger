USE `ldgr`;

START TRANSACTION;

DROP PROCEDURE IF EXISTS `CreateBudget`;

DELIMITER ;;

CREATE PROCEDURE `CreateBudget` (
      $Name                          varchar(50)
    , $Amount                        decimal(15,2)
    , $Type                          varchar(50)
    , $BudgetGroup                   varchar(50)
    , $BudgetCycle                   date
    , $DueDate                       int
    , $IsPaidByCreditCardNotAccount  boolean
    , $Color                         char(7)
    , $date_created                  datetime
    , $created_by                    int
    , $date_modified                 datetime
    , $modified_by                   int
    , $UserId                        int
)
BEGIN
	# Set default parameters
    SET $date_created = IFNULL($date_created, CURRENT_TIMESTAMP());
    SET $created_by = IFNULL($created_by, NULL);
    SET $date_modified = IFNULL($date_modified, CURRENT_TIMESTAMP());
    SET $modified_by = IFNULL($modified_by, NULL);
    SET $UserId = IFNULL($UserId, NULL);    


	# Validate the Type
	IF $Type IS NOT NULL AND NOT EXISTS (
		SELECT 1 FROM Type WHERE Name = $Type AND ResourceType = 'B'
	)
	THEN
		SET @throw = CONCAT('Invalid Type: ', COALESCE($Type, 'NULL'), '.');
		SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = @throw;
	END IF;

	# Validate the BudgetCycle
	IF $BudgetCycle IS NOT NULL AND NOT EXISTS (
		SELECT 1 FROM BudgetCycle WHERE BudgetCycle = $BudgetCycle
	)
	THEN
		SET @throw = CONCAT('Invalid BudgetCycle: ', COALESCE($BudgetCycle, 'NULL'), '.');
		SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = @throw;
	END IF;

	# Validate the BudgetGroup
	IF $BudgetGroup IS NOT NULL AND NOT EXISTS (
		SELECT 1 FROM BudgetGroup WHERE Name = $BudgetGroup
	)
	THEN
		SET @throw = CONCAT('Invalid BudgetGroup: ', COALESCE($BudgetGroup, 'NULL'), '.');
		SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = @throw;
	END IF;

	# Validate the Color  # can be null
	IF $Color IS NOT NULL AND NOT EXISTS (
		SELECT 1 FROM Color WHERE Value = $Color
	)
	THEN
		SET @throw = CONCAT('Invalid Color: ', COALESCE($Color, 'NULL'), '.');
		SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = @throw;
	END IF;

	# Create the budget
	INSERT INTO Budget (
		Name
		, Amount
		, TypeId
		, BudgetGroupId
		, BudgetCycleId
		, DueDate
		, IsPaidByCreditCardNotAccount
		, ColorId
		, date_created
		, created_by
		, date_modified
		, modified_by
		, UserId
	)
	WITH denormalized AS (
		SELECT
			  $Name AS Name
			, $Amount AS Amount
			, $Type AS Type
			, $BudgetGroup AS BudgetGroup
			, $BudgetCycle AS BudgetCycle
			, $DueDate AS DueDate
			, $IsPaidByCreditCardNotAccount AS IsPaidByCreditCardNotAccount
			, $Color AS Color
			, $date_created AS date_created
			, $created_by AS created_by
			, $date_modified AS date_modified
			, $modified_by AS modified_by
			, $UserId AS UserId
	)
	SELECT 
		  denormalized.Name
		, denormalized.Amount
		, Type.TypeId
		, BudgetGroup.BudgetGroupId
		, BudgetCycle.BudgetCycleId
		, denormalized.DueDate
		, denormalized.IsPaidByCreditCardNotAccount
		, Color.ColorId
		, denormalized.date_created
		, denormalized.created_by
		, denormalized.date_modified
		, denormalized.modified_by
		, denormalized.UserId
	FROM denormalized
	LEFT OUTER JOIN Type
		ON Type.Name = denormalized.Type
		AND Type.ResourceType = 'B'
	LEFT OUTER JOIN BudgetGroup
		ON BudgetGroup.Name = denormalized.BudgetGroup
	LEFT OUTER JOIN BudgetCycle
		ON BudgetCycle.BudgetCycle = denormalized.BudgetCycle
	LEFT OUTER JOIN Color
		ON Color.Value = denormalized.Color
	LEFT OUTER JOIN Budget
		ON Budget.Name = denormalized.Name
		AND Budget.Amount = denormalized.Amount
		AND Budget.TypeId = Type.TypeId
		AND Budget.BudgetGroupId = BudgetGroup.BudgetGroupId
		AND Budget.BudgetCycleId = BudgetCycle.BudgetCycleId
		AND Budget.DueDate = denormalized.DueDate
		AND Budget.IsPaidByCreditCardNotAccount = denormalized.IsPaidByCreditCardNotAccount
		AND Budget.ColorId = Color.ColorId
	WHERE Budget.BudgetId IS NULL;

	# Save the last insert id
	SET @budgetId = LAST_INSERT_ID(); 

	SELECT @budgetId AS `LAST_INSERT_ID()`;
END ;;

DELIMITER ;

COMMIT;
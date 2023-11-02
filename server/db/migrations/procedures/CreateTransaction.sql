USE `ldgr`;

START TRANSACTION;

DROP PROCEDURE IF EXISTS `CreateTransaction`;

DELIMITER ;;

CREATE PROCEDURE `CreateTransaction` (
      $TransactionDate      datetime
    , $PostedDate           datetime
    , $Account              varchar(24)
    , $Type                 varchar(50)
    , $Description          varchar(100)
    , $DescriptionManual    varchar(100)
    , $DescriptionDisplay   varchar(100)
    , $BudgetCycle          datetime
    , $IsAutoCategorized    boolean
    , $IsUpdatedByUser      boolean
    , $Amount               decimal
    , $Budget               varchar(50)
    , $Notes                varchar(100)
    , $Tags                 varchar(100)
    , $date_created         datetime
    , $created_by           int
    , $date_modified        datetime
    , $modified_by          int
    , $UserId               int
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
		SELECT 1 FROM Type WHERE Name = $Type AND ResourceType = 'T'
	)
	THEN
		SET @throw = CONCAT('Invalid Type: ', COALESCE($Type, 'NULL'), '.');
		SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = @throw;
	END IF;

	# Validate the Account
	IF $Account IS NOT NULL AND NOT EXISTS (
		SELECT 1 FROM Account WHERE AccountNumber = $Account
	)
	THEN
		SET @throw = CONCAT('Invalid Account: ', COALESCE($Account, 'NULL'), '.');
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

	# Validate the Budget
	IF $Budget IS NOT NULL AND NOT EXISTS (
		SELECT 1 FROM Budget INNER JOIN BudgetCycle ON Budget.BudgetCycleId = BudgetCycle.BudgetCycleId WHERE Budget.Name = $Budget AND BudgetCycle.BudgetCycle = $BudgetCycle
	)
	THEN
		SET @throw = CONCAT('Invalid Budget for Budget Cycle "', COALESCE($BudgetCycle, 'NULL'), '": ', COALESCE($Budget, 'NULL'), '.');
		SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = @throw;
	END IF;

	# Create the transaction
	INSERT INTO TransactionMaster (
		  TransactionDate
		, PostedDate
		, AccountId
		, TypeId
		, Description
		, DescriptionManual
		, DescriptionDisplay
		, BudgetCycleId
		, IsAutoCategorized
		, IsUpdatedByUser
	)
	WITH denormalized AS (
		SELECT
			  $TransactionDate AS TransactionDate
			, $PostedDate AS PostedDate
			, $Account AS Account
			, $Type AS Type
			, $Description AS Description
			, $DescriptionManual AS DescriptionManual
			, $DescriptionDisplay AS DescriptionDisplay
			, $BudgetCycle AS BudgetCycle
			, $IsAutoCategorized AS IsAutoCategorized
			, $IsUpdatedByUser AS IsUpdatedByUser
	)
	SELECT 
		  denormalized.TransactionDate
		, denormalized.PostedDate
		, Account.AccountId
		, Type.TypeId
		, denormalized.Description
		, denormalized.DescriptionManual
		, denormalized.DescriptionDisplay
		, BudgetCycle.BudgetCycleId
		, denormalized.IsAutoCategorized
		, denormalized.IsUpdatedByUser
	FROM denormalized
	LEFT OUTER JOIN Type
		ON Type.Name = denormalized.Type
		AND Type.ResourceType = 'T'
	LEFT OUTER JOIN BudgetCycle
		ON BudgetCycle.BudgetCycle = denormalized.BudgetCycle
	LEFT OUTER JOIN Account
		ON Account.AccountNumber = denormalized.Account
	LEFT OUTER JOIN TransactionMaster
		ON TransactionMaster.TransactionDate = denormalized.TransactionDate
		#AND TransactionMaster.PostedDate = denormalized.PostedDate
		AND TransactionMaster.AccountId = Account.AccountId
		#AND TransactionMaster.TypeId = Type.TypeId
		AND TransactionMaster.Description = denormalized.Description
		#AND TransactionMaster.DescriptionManual = denormalized.DescriptionManual
		#AND TransactionMaster.DescriptionDisplay = denormalized.DescriptionDisplay
		AND TransactionMaster.BudgetCycleId = BudgetCycle.BudgetCycleId
		#AND TransactionMaster.IsAutoCategorized = denormalized.IsAutoCategorized
		#AND TransactionMaster.IsUpdatedByUser = denormalized.IsUpdatedByUser
	WHERE TransactionMaster.TransactionId IS NULL;

	# Save the last insert id
	SET @transactionId = LAST_INSERT_ID(); 

	INSERT INTO TransactionDetail (
		  TransactionId
		, Amount
		, BudgetId
		, Notes
	)
	WITH denormalized AS (
		SELECT
			@transactionId AS TransactionId
			, $Amount AS Amount
			, $Budget AS Budget
			, $Notes AS Notes
	)
	SELECT 
		  denormalized.TransactionId
		, denormalized.Amount
		, Budget.BudgetId
		, denormalized.Notes
	FROM denormalized
	LEFT OUTER JOIN BudgetCycle
		ON BudgetCycle.BudgetCycle = $BudgetCycle
	LEFT OUTER JOIN Budget
		ON Budget.Name = denormalized.Budget
		AND Budget.BudgetCycleId = BudgetCycle.BudgetCycleId
	#LEFT OUTER JOIN TransactionDetail
	#	ON TransactionDetail.TransactionId = denormalized.TransactionId
	#	AND TransactionDetail.Amount = denormalized.Amount
	#	AND TransactionDetail.BudgetId = Budget.BudgetId
	#	AND TransactionDetail.Notes = denormalized.Notes
	#WHERE TransactionDetail.TransactionDetailId IS NULL
    ;
    
    # Insert tags, if exists
    IF($Tags IS NOT NULL)
    THEN
		CALL ConvertArrayToList($Tags, ',');
		INSERT INTO Tag (Name, ColorId, UserId)
		SELECT 
			value
			, NULL
			, $UserId
		FROM listTable newTags
		LEFT OUTER JOIN Tag
			ON newTags.value = Tag.Name
		WHERE Tag.TagId IS NULL;
		
		INSERT INTO TransactionTag (TransactionId, TagId, UserId)
		SELECT 
			@transactionId
			, Tag.TagId
			, $UserId
		FROM listTable newTags
		INNER JOIN Tag
			ON newTags.value = Tag.Name;
	END IF;

	# Return the new transaction
	SELECT
		*
	FROM TransactionMaster
	INNER JOIN TransactionDetail
		ON TransactionMaster.TransactionId = TransactionDetail.TransactionId
	WHERE TransactionMaster.TransactionId = @transactionId;

	SELECT @transactionId AS `LAST_INSERT_ID()`;
END ;;

DELIMITER ;

COMMIT;


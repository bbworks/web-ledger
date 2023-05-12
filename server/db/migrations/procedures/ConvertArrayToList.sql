USE `ldgr`;

START TRANSACTION;

DROP PROCEDURE IF EXISTS `ConvertArrayToList`;

DELIMITER ;;

CREATE PROCEDURE `ConvertArrayToList` (
      $array        VARCHAR(1000)
      , $delimiter  VARCHAR(10)
)
BEGIN
	SET $delimiter = IFNULL($delimiter, ',');
    
	DROP TEMPORARY TABLE IF EXISTS listTable;
	CREATE TEMPORARY TABLE listTable (
		id       int AUTO_INCREMENT PRIMARY KEY
        , value  varchar(100)
	);
    
    # Dynamically insert the regex-split array string items into the table
	SET @sql := CONCAT('INSERT INTO listTable (value) VALUES (''', REGEXP_REPLACE(COALESCE($array, ''), CONCAT('[:space:]*', $delimiter ,'[:space:]*'), '''), ('''), ''');');
	PREPARE stmt FROM @sql;
	EXECUTE stmt;
	DEALLOCATE PREPARE stmt;
    
    # Cleanup NULL values
    DELETE FROM listTable WHERE value = '' OR value IS NULL;
END;;

DELIMITER ;

COMMIT;


-- CALL ConvertArrayToList('tag1, tag2, tag3', ',');
-- SELECT value FROM listTable;

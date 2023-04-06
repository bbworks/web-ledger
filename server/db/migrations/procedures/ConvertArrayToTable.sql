USE `ldgr`;

START TRANSACTION;

DROP PROCEDURE IF EXISTS `ConvertArrayToTable`;

DELIMITER ;;

CREATE PROCEDURE `ConvertArrayToTable` (
      $array              VARCHAR(1000)
      , $columnDelimiter  VARCHAR(10)
      , $rowDelimiter     VARCHAR(10)
)
BEGIN
	SET $columnDelimiter = IFNULL($columnDelimiter, ',');
	SET $rowDelimiter = IFNULL($rowDelimiter, ';');
    
	DROP TEMPORARY TABLE IF EXISTS arrayTable;
-- 	CREATE TEMPORARY TABLE arrayTable (
-- 		id       int AUTO_INCREMENT PRIMARY KEY
--         , value  varchar(100)
-- 	);
    
	SET @rowJoinSql := '''\r\nUNION SELECT ''';
    SET @sql := CONCAT('CREATE TEMPORARY TABLE arrayTable AS (SELECT ''', REGEXP_REPLACE(REGEXP_REPLACE(REGEXP_REPLACE($array, CONCAT('[:space:]*', $rowDelimiter ,'$'), ''), CONCAT('[:space:]*', $columnDelimiter ,'[:space:]*'), ''', '''), CONCAT('[:space:]*', $rowDelimiter ,'[:space:]*'), @rowJoinSql), '''');
	SET @sql := CONCAT(@sql, ')');
    PREPARE stmt FROM @sql;
	EXECUTE stmt;
	DEALLOCATE PREPARE stmt;
END;;

DELIMITER ;

COMMIT;


-- CALL ConvertArrayToTable('tag1, value1; tag2, value2; tag3, value3;', ',', ';');
-- SELECT * FROM arrayTable;

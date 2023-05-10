CREATE USER 'ldgr'@'localhost' 
	IDENTIFIED WITH caching_sha2_password BY '################';
GRANT 
	/* Object Rights */
	SELECT
	, INSERT
	, UPDATE
	, DELETE
	, EXECUTE
	, SHOW VIEW 

	/* DDL Rights */
	, CREATE
	, ALTER
	, CREATE VIEW
	, CREATE ROUTINE
	, ALTER ROUTINE
	, DROP
	, TRIGGER

	/* Other Rights */
	, CREATE TEMPORARY TABLES
ON ldgr.* TO 'ldgr'@'localhost';

# Grant SUPER, to allow for CREATE FUNCTION and INSERT statements in master-slave replication (as the slave has full privileges, and will execute potentially dangerous statements [even if master cannot?])
# https://stackoverflow.com/questions/56389698/why-super-privileges-are-disabled-when-binary-logging-option-is-on
#  https://dev.mysql.com/doc/refman/8.0/en/stored-programs-logging.html
GRANT SUPER ON *.* TO `ldgr`@`localhost`;

FLUSH PRIVILEGES;
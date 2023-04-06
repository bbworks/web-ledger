CREATE USER 'ldgr'@'localhost' 
	IDENTIFIED WITH caching_sha2_password BY '################';
GRANT 
	SELECT
	, INSERT
	, UPDATE
	, DELETE
	, EXECUTE
	, SHOW VIEW 
ON ldgr.* TO 'ldgr'@'localhost';
FLUSH PRIVILEGES;
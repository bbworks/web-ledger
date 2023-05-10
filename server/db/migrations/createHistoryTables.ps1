Set-Location $PSScriptRoot

try
{
    # Dynamically create a MySQL options config INI, to use for connection
    (Get-Content .\..\..\.env -Raw).ForEach({
        $hostname = [Regex]::Match($_, 'MYSQL_HOST=(.+)').Groups[1].Value
        $port = [Regex]::Match($_, 'MYSQL_PORT=(.+)').Groups[1].Value
        $databasename = [Regex]::Match($_, 'MYSQL_DB=(.+)').Groups[1].Value
        $username = [Regex]::Match($_, 'MYSQL_USER=(.+)').Groups[1].Value
        $password = [Regex]::Match($_, 'MYSQL_PASS=(.+)').Groups[1].Value

        return "[client]
host=$hostname
port=$port
database=$databasename
user=$username
password=$password" 
    }) | Out-File -FilePath .\mysql.cnf -Encoding ascii
}
catch
{
    throw "Failed to create temporary mysql.cnf file: $_"
}

try
{
    # Run through each table, creating a history table & triggers
    (Get-ChildItem "$PSScriptRoot\tables" -Recurse).
        Where({!$_.PSIsContainer}).
        ForEach({
            $content = $_ | Get-Content -Raw

            $fileName = [Regex]::Match($content, '# title: (.+)\r\n').Groups[1].Value
            $tableName = [Regex]::Match($content, '# name: (.+)\r\n').Groups[1].Value
            $primaryKey = [Regex]::Match($content, '# primaryKey: (.+)\r\n').Groups[1].Value

    
            return "DROP TABLE IF EXISTS History_$tableName;

        CREATE TABLE History_$tableName LIKE $tableName;

        ALTER TABLE History_$tableName 
	        DROP PRIMARY KEY
	        , MODIFY COLUMN $primaryKey int NOT NULL;
        ALTER TABLE History_$tableName 
	        ADD COLUMN RevisionId int AUTO_INCREMENT NOT NULL FIRST
	        , ADD PRIMARY KEY PK_History_$tableName (RevisionId, $primaryKey);
        ALTER TABLE History_$tableName ADD COLUMN RevisionDate datetime NOT NULL DEFAULT CURRENT_TIMESTAMP AFTER RevisionId;
        ALTER TABLE History_$tableName ADD COLUMN Action varchar(16) NOT NULL DEFAULT 'INSERT' AFTER RevisionDate;


        DROP TRIGGER IF EXISTS History_$tableName`_Insert;
        DELIMITER ;;
        CREATE TRIGGER History_$tableName`_Insert
        AFTER INSERT 
        ON $tableName
        FOR EACH ROW
        BEGIN
            INSERT INTO History_$tableName
            SELECT
                NULL
                , CURRENT_TIMESTAMP()
                , 'INSERT'
                , $tableName.*
            FROM $tableName
            WHERE $tableName.$primaryKey = NEW.$primaryKey;
        END;;
        DELIMITER ;

        DROP TRIGGER IF EXISTS History_$tableName`_Update;
        DELIMITER ;;
        CREATE TRIGGER History_$tableName`_Update
        AFTER UPDATE 
        ON $tableName
        FOR EACH ROW
        BEGIN
            INSERT INTO History_$tableName
            SELECT
                NULL
                , CURRENT_TIMESTAMP()
                , 'UPDATE'
                , $tableName.*
            FROM $tableName
            WHERE $tableName.$primaryKey = NEW.$primaryKey;
        END;;
        DELIMITER ;

        DROP TRIGGER IF EXISTS History_$tableName`_Delete;
        DELIMITER ;;
        CREATE TRIGGER History_$tableName`_Delete
        BEFORE DELETE 
        ON $tableName
        FOR EACH ROW
        BEGIN
            INSERT INTO History_$tableName
            SELECT
                NULL
                , CURRENT_TIMESTAMP()
                , 'DELETE'
                , $tableName.*
            FROM $tableName
            WHERE $tableName.$primaryKey = OLD.$primaryKey;
        END;;
        DELIMITER ;
        "
        }).
        ForEach({
            $_ | mysql --defaults-extra-file=".\mysql.cnf"
        })

    # Clean up the MySQL options config INI
    try
    {
        Remove-Item -Path .\mysql.cnf -ErrorAction Stop
    }
    catch
    {
        if($_.Exception.Message -notlike "Cannot find path '*' because it does not exist.")
        {
            throw "Failed to create temporary mysql.cnf file: $_"
        }
    }
}
catch
{
    Remove-Item -Path .\mysql.cnf -ErrorAction SilentlyContinue
    throw "Failed to create `"History_*`" tables and triggers: $_"
}
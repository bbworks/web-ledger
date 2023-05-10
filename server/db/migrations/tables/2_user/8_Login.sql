# ---
# title: 8_Login.sql
# name: Login
# primaryKey: LoginId
# ---

USE ldgr;

DROP TABLE IF EXISTS Login;
CREATE TABLE Login (
      LoginId        int           NOT NULL AUTO_INCREMENT
    , UserName       varchar(50)   NOT NULL
    , EmailAddress   varchar(100)  NOT NULL
    , date_created   datetime      NOT NULL  DEFAULT CURRENT_TIMESTAMP
    , created_by     int           NULL  DEFAULT NULL
    , date_modified  datetime      NOT NULL  DEFAULT CURRENT_TIMESTAMP
    , modified_by    int           NULL  DEFAULT NULL
    , CONSTRAINT PK_Login_LoginId PRIMARY KEY CLUSTERED (LoginId)
) ENGINE=InnoDB AUTO_INCREMENT=1;

ALTER TABLE Login ADD CONSTRAINT UQ_Login_UserName UNIQUE (UserName);

ALTER TABLE Login ADD CONSTRAINT UQ_Login_EmailAddress UNIQUE (EmailAddress);


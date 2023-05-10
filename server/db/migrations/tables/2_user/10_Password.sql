# ---
# title: 10_Password.sql
# name: Password
# primaryKey: PasswordId
# ---

USE ldgr;

DROP TABLE IF EXISTS Password;
CREATE TABLE Password (
      PasswordId     int           NOT NULL AUTO_INCREMENT
    , LoginId        int           NOT NULL
    , PasswordHash   varchar(128)  NOT NULL
    , PasswordSalt   varchar(32)   NOT NULL
    , IsActive       boolean       NOT NULL
    , date_created   datetime      NOT NULL  DEFAULT CURRENT_TIMESTAMP
    , created_by     int           NULL  DEFAULT NULL
    , date_modified  datetime      NOT NULL  DEFAULT CURRENT_TIMESTAMP
    , modified_by    int           NULL  DEFAULT NULL
    , CONSTRAINT PK_Password_PasswordId PRIMARY KEY CLUSTERED (PasswordId)
) ENGINE=InnoDB AUTO_INCREMENT=1;

ALTER TABLE Password ADD CONSTRAINT FK_Password_LoginId FOREIGN KEY (LoginId) REFERENCES Login(LoginId);


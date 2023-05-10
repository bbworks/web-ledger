# ---
# title: 13_Account.sql
# name: Account
# primaryKey: AccountId
# ---

USE ldgr;

DROP TABLE IF EXISTS Account;
CREATE TABLE Account (
      AccountId       int          NOT NULL AUTO_INCREMENT
    , AccountNumber   varchar(24)  NOT NULL
    , Name            varchar(50)  NOT NULL
    , BankId          int          NULL
    , ColorId         int          NULL
    , TypeId          int          NOT NULL
    , date_created    datetime     NOT NULL  DEFAULT CURRENT_TIMESTAMP
    , created_by      int          NULL  DEFAULT NULL
    , date_modified   datetime     NOT NULL  DEFAULT CURRENT_TIMESTAMP
    , modified_by     int          NULL  DEFAULT NULL
    , UserId          int          NULL   DEFAULT NULL
    , CONSTRAINT PK_Account_AccountId PRIMARY KEY CLUSTERED (AccountId)
) ENGINE=InnoDB AUTO_INCREMENT=1;

ALTER TABLE Account ADD CONSTRAINT FK_Account_BankId FOREIGN KEY (BankId) REFERENCES Bank(BankId);

ALTER TABLE Account ADD CONSTRAINT FK_Account_ColorId FOREIGN KEY (ColorId) REFERENCES Color(ColorId);

ALTER TABLE Account ADD CONSTRAINT FK_Account_TypeId FOREIGN KEY (TypeId) REFERENCES Type(TypeId);

ALTER TABLE Account ADD CONSTRAINT UQ_Account_AccountNumber_BankId_UserId UNIQUE (AccountNumber, BankId, UserId);


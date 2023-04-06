USE ldgr;

DROP TABLE IF EXISTS User;
CREATE TABLE User (
      UserId           int          NOT NULL AUTO_INCREMENT
    , FirstName        varchar(50)  NOT NULL
    , LastName         varchar(50)  NOT NULL
    , Gender           char(1)      NULL
    , PhoneNumberText  varchar(50)  NULL
    , PhoneNumber      char(10)     NULL
    , AddressId        int          NULL
    , IsActive         boolean      NULL
    , date_created     datetime     NOT NULL  DEFAULT CURRENT_TIMESTAMP
    , created_by       int          NULL  DEFAULT NULL
    , date_modified    datetime     NOT NULL  DEFAULT CURRENT_TIMESTAMP
    , modified_by      int          NULL  DEFAULT NULL
    , CONSTRAINT PK_User_UserId PRIMARY KEY CLUSTERED (UserId)
) ENGINE=InnoDB AUTO_INCREMENT=1;

ALTER TABLE User ADD CONSTRAINT FK_User_AddressId FOREIGN KEY (AddressId) REFERENCES Address(AddressId);

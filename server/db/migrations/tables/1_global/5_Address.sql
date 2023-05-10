# ---
# title: 5_Address.sql
# name: Address
# primaryKey: AddressId
# ---

USE ldgr;

DROP TABLE IF EXISTS Address;
CREATE TABLE Address (
      AddressId       int           NOT NULL AUTO_INCREMENT
    , StreetAddress1  varchar(100)  NOT NULL
    , StreetAddress2  varchar(100)  NULL
    , Building        varchar(10)   NULL
    , AptNumber       varchar(10)   NULL
    , City            varchar(100)  NOT NULL
    , StateId         int           NOT NULL
    , Zip             varchar(10)   NOT NULL
    , CountryId       int           NOT NULL
    , date_created    datetime      NOT NULL  DEFAULT CURRENT_TIMESTAMP
    , created_by      int           NULL  DEFAULT NULL
    , date_modified   datetime      NOT NULL  DEFAULT CURRENT_TIMESTAMP
    , modified_by     int           NULL  DEFAULT NULL
    , UserId          int           NULL   DEFAULT NULL
    , CONSTRAINT PK_Address_AddressId PRIMARY KEY CLUSTERED (AddressId)
) ENGINE=InnoDB AUTO_INCREMENT=1;

ALTER TABLE Address ADD CONSTRAINT FK_Address_StateId FOREIGN KEY (StateId) REFERENCES State(StateId);

ALTER TABLE Address ADD CONSTRAINT FK_Address_CountryId FOREIGN KEY (CountryId) REFERENCES Country(CountryId);


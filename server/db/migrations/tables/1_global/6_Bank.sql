USE ldgr;

DROP TABLE IF EXISTS Bank;
CREATE TABLE Bank (
      BankId         int          NOT NULL AUTO_INCREMENT
    , Name           varchar(50)  NOT NULL
    , date_created   datetime     NOT NULL  DEFAULT CURRENT_TIMESTAMP
    , created_by     int          NULL  DEFAULT NULL
    , date_modified  datetime     NOT NULL  DEFAULT CURRENT_TIMESTAMP
    , modified_by    int          NULL  DEFAULT NULL
    , CONSTRAINT PK_Bank_BankId PRIMARY KEY CLUSTERED (BankId)
) ENGINE=InnoDB AUTO_INCREMENT=1;

ALTER TABLE Bank ADD CONSTRAINT UQ_Bank_Name UNIQUE (Name);

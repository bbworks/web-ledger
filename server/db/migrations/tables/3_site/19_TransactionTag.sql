# ---
# title: 19_TransactionTag.sql
# name: TransactionTag
# primaryKey: TransactionTagId
# ---

USE ldgr;

DROP TABLE IF EXISTS TransactionTag;
CREATE TABLE TransactionTag (
      TransactionTagId   int       NOT NULL AUTO_INCREMENT
    , TransactionId      int       NOT NULL
    , TagId              int       NOT NULL
    , date_created       datetime  NOT NULL  DEFAULT CURRENT_TIMESTAMP
    , created_by         int       NULL  DEFAULT NULL
    , date_modified      datetime  NOT NULL  DEFAULT CURRENT_TIMESTAMP
    , modified_by        int       NULL  DEFAULT NULL
    , UserId             int       NULL   DEFAULT NULL
    , CONSTRAINT PK_TransactionTag_TransactionTagId PRIMARY KEY CLUSTERED (TransactionTagId)
) ENGINE=InnoDB AUTO_INCREMENT=1;

ALTER TABLE TransactionTag ADD CONSTRAINT FK_TransactionTag_TransactionId FOREIGN KEY (TransactionId) REFERENCES TransactionMaster(TransactionId) ON UPDATE CASCADE ON DELETE CASCADE;

ALTER TABLE TransactionTag ADD CONSTRAINT FK_TransactionTag_TagId FOREIGN KEY (TagId) REFERENCES Tag(TagId) ON UPDATE CASCADE ON DELETE CASCADE;


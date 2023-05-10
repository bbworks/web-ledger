# ---
# title: 17_TransactionMaster.sql
# name: TransactionMaster
# primaryKey: TransactionId
# ---

USE ldgr;

DROP TABLE IF EXISTS TransactionMaster;
CREATE TABLE TransactionMaster (
      TransactionId       int           NOT NULL AUTO_INCREMENT
    , TransactionDate     datetime      NOT NULL
    , PostedDate          datetime      NULL
    , AccountId           int           NOT NULL
    , TypeId              int           NOT NULL
    , Description         varchar(100)  NOT NULL
    , DescriptionManual   varchar(100)  NULL
    , DescriptionDisplay  varchar(100)  NULL
    , BudgetCycleId       int           NOT NULL
    , IsAutoCategorized   boolean       NOT NULL
    , IsUpdatedByUser     boolean       NOT NULL
    , date_created        datetime      NOT NULL  DEFAULT CURRENT_TIMESTAMP
    , created_by          int           NULL  DEFAULT NULL
    , date_modified       datetime      NOT NULL  DEFAULT CURRENT_TIMESTAMP
    , modified_by         int           NULL  DEFAULT NULL
    , UserId              int           NULL   DEFAULT NULL
    , CONSTRAINT PK_TransactionMaster_TransactionId PRIMARY KEY CLUSTERED (TransactionId)
) ENGINE=InnoDB AUTO_INCREMENT=1;

ALTER TABLE TransactionMaster ADD CONSTRAINT FK_TransactionMaster_AccountId FOREIGN KEY (AccountId) REFERENCES Account(AccountId) ON UPDATE CASCADE ON DELETE CASCADE;

ALTER TABLE TransactionMaster ADD CONSTRAINT FK_TransactionMaster_BudgetCycleId FOREIGN KEY (BudgetCycleId) REFERENCES BudgetCycle(BudgetCycleId) ON UPDATE CASCADE ON DELETE CASCADE;


# ---
# title: 18_TransactionDetail.sql
# name: TransactionDetail
# primaryKey: TransactionDetailId
# ---

USE ldgr;

DROP TABLE IF EXISTS TransactionDetail;
CREATE TABLE TransactionDetail (
      TransactionDetailId  int            NOT NULL AUTO_INCREMENT
    , TransactionId        int            NOT NULL
    , Amount               decimal(15,2)  NOT NULL
    , BudgetId             int            NULL
    , Notes                varchar(100)   NULL
    , date_created         datetime       NOT NULL  DEFAULT CURRENT_TIMESTAMP
    , created_by           int            NULL  DEFAULT NULL
    , date_modified        datetime       NOT NULL  DEFAULT CURRENT_TIMESTAMP
    , modified_by          int            NULL  DEFAULT NULL
    , UserId               int            NULL   DEFAULT NULL
    , CONSTRAINT PK_TransactionDetail_TransactionDetailId PRIMARY KEY CLUSTERED (TransactionDetailId)
) ENGINE=InnoDB AUTO_INCREMENT=1;

ALTER TABLE TransactionDetail ADD CONSTRAINT FK_TransactionDetail_TransactionId FOREIGN KEY (TransactionId) REFERENCES TransactionMaster(TransactionId) ON UPDATE CASCADE ON DELETE CASCADE;

ALTER TABLE TransactionDetail ADD CONSTRAINT FK_TransactionDetail_BudgetId FOREIGN KEY (BudgetId) REFERENCES Budget(BudgetId) ON UPDATE CASCADE ON DELETE CASCADE;


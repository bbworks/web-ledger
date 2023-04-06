USE ldgr;

DROP TABLE IF EXISTS BudgetCycle;
CREATE TABLE BudgetCycle (
      BudgetCycleId   int       NOT NULL AUTO_INCREMENT
    , BudgetCycle     date      NOT NULL
    , date_created    datetime  NOT NULL  DEFAULT CURRENT_TIMESTAMP
    , created_by      int       NULL  DEFAULT NULL
    , date_modified   datetime  NOT NULL  DEFAULT CURRENT_TIMESTAMP
    , modified_by     int       NULL  DEFAULT NULL
    , UserId          int       NULL   DEFAULT NULL
    , CONSTRAINT PK_BudgetCycle_BudgetCycleId PRIMARY KEY CLUSTERED (BudgetCycleId)
) ENGINE=InnoDB AUTO_INCREMENT=1;

ALTER TABLE BudgetCycle ADD CONSTRAINT UQ_BudgetCycle_BudgetCycle UNIQUE (BudgetCycle);

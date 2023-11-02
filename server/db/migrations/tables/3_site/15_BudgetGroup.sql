﻿# ---
# title: 15_BudgetGroup.sql
# name: BudgetGroup
# primaryKey: BudgetGroupId
# ---

USE ldgr;

DROP TABLE IF EXISTS BudgetGroup;
CREATE TABLE BudgetGroup (
      BudgetGroupId  int          NOT NULL AUTO_INCREMENT
    , Name           varchar(50)  NOT NULL
    , TypeId         int          NOT NULL
    , ColorId        int          NULL
    , date_created   datetime     NOT NULL  DEFAULT CURRENT_TIMESTAMP
    , created_by     int          NULL  DEFAULT NULL
    , date_modified  datetime     NOT NULL  DEFAULT CURRENT_TIMESTAMP
    , modified_by    int          NULL  DEFAULT NULL
    , UserId         int          NULL   DEFAULT NULL
    , CONSTRAINT PK_BudgetGroup_BudgetGroupId PRIMARY KEY CLUSTERED (BudgetGroupId)
) ENGINE=InnoDB AUTO_INCREMENT=1;

ALTER TABLE BudgetGroup ADD CONSTRAINT FK_BudgetGroup_TypeId FOREIGN KEY (TypeId) REFERENCES Type(TypeId);

ALTER TABLE BudgetGroup ADD CONSTRAINT FK_BudgetGroup_ColorId FOREIGN KEY (ColorId) REFERENCES Color(ColorId);

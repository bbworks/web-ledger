USE ldgr;

DROP TABLE IF EXISTS Budget;
CREATE TABLE Budget (
      BudgetId                      int            NOT NULL AUTO_INCREMENT
    , Name                          varchar(50)    NOT NULL
    , Amount                        decimal(15,2)  NOT NULL
    , TypeId                        int            NOT NULL
    , BudgetGroupId                 int            NOT NULL
    , BudgetCycleId                 int            NOT NULL
    , DueDate                       int            NULL
    , IsPaidByCreditCardNotAccount  boolean        NULL
    , ColorId                       int            NULL
    , date_created                  datetime       NOT NULL  DEFAULT CURRENT_TIMESTAMP
    , created_by                    int            NULL  DEFAULT NULL
    , date_modified                 datetime       NOT NULL  DEFAULT CURRENT_TIMESTAMP
    , modified_by                   int            NULL  DEFAULT NULL
    , UserId                        int            NULL   DEFAULT NULL
    , CONSTRAINT PK_Budget_BudgetId PRIMARY KEY CLUSTERED (BudgetId)
) ENGINE=InnoDB AUTO_INCREMENT=1;

ALTER TABLE Budget ADD CONSTRAINT FK_Budget_TypeId FOREIGN KEY (TypeId) REFERENCES Type(TypeId);

ALTER TABLE Budget ADD CONSTRAINT FK_Budget_BudgetGroupId FOREIGN KEY (BudgetGroupId) REFERENCES BudgetGroup(BudgetGroupId);

ALTER TABLE Budget ADD CONSTRAINT FK_Budget_BudgetCycleId FOREIGN KEY (BudgetCycleId) REFERENCES BudgetCycle(BudgetCycleId);

ALTER TABLE Budget ADD CONSTRAINT FK_Budget_ColorId FOREIGN KEY (ColorId) REFERENCES Color(ColorId);

ALTER TABLE Budget ADD CONSTRAINT UQ_Budget_Name_BudgetCycleId UNIQUE (Name, BudgetCycleId);

ALTER TABLE Budget ADD CONSTRAINT CK_Budget_DueDate CHECK (DueDate BETWEEN 1 AND 28);

# ---
# title: 3_State.sql
# name: State
# primaryKey: StateId
# ---

USE ldgr;

DROP TABLE IF EXISTS State;
CREATE TABLE State (
      StateId    int           NOT NULL AUTO_INCREMENT
    , StateCode  char(2)       NOT NULL
    , Name       varchar(100)  NOT NULL
    , CONSTRAINT PK_State_StateId PRIMARY KEY CLUSTERED (StateId)
) ENGINE=InnoDB AUTO_INCREMENT=1;

ALTER TABLE State ADD CONSTRAINT UQ_State_StateCode UNIQUE (StateCode);


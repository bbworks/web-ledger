# ---
# title: 1_Color.sql
# name: Color
# primaryKey: ColorId
# ---

USE ldgr;

DROP TABLE IF EXISTS Color;
CREATE TABLE Color (
      ColorId        int       NOT NULL AUTO_INCREMENT
    , ColorValue     char(7)   NOT NULL
    , date_created   datetime  NOT NULL  DEFAULT CURRENT_TIMESTAMP
    , created_by     int       NULL  DEFAULT NULL
    , date_modified  datetime  NOT NULL  DEFAULT CURRENT_TIMESTAMP
    , modified_by    int       NULL  DEFAULT NULL
    , CONSTRAINT PK_Color_ColorId PRIMARY KEY CLUSTERED (ColorId)
) ENGINE=InnoDB AUTO_INCREMENT=1;

ALTER TABLE Color ADD CONSTRAINT UQ_Color_Value UNIQUE (Value);

ALTER TABLE Color ADD CONSTRAINT CK_Color_Value CHECK (UPPER(Value) REGEXP '\#[0-9A-F]{6}');

# (Account/Budget/Transaction)


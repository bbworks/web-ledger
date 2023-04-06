USE ldgr;

DROP TABLE IF EXISTS Type;
CREATE TABLE Type ( # (Account/Budget/Transaction)    
      TypeId          int          NOT NULL AUTO_INCREMENT
    , Name            varchar(50)  NOT NULL
    , ResourceType    varchar(2)   NULL
    , ColorId         int          NULL
    , DefaultTypeId   int          NULL
    , date_created    datetime     NOT NULL  DEFAULT CURRENT_TIMESTAMP
    , created_by      int          NULL  DEFAULT NULL
    , date_modified   datetime     NOT NULL  DEFAULT CURRENT_TIMESTAMP
    , modified_by     int          NULL  DEFAULT NULL
    , CONSTRAINT PK_Type_TypeId PRIMARY KEY CLUSTERED (TypeId)
) ENGINE=InnoDB AUTO_INCREMENT=1;

ALTER TABLE Type ADD CONSTRAINT FK_Type_ColorId FOREIGN KEY (ColorId) REFERENCES Color(ColorId);

ALTER TABLE Type ADD CONSTRAINT FK_Type_DefaultTypeId FOREIGN KEY (DefaultTypeId) REFERENCES Type(TypeId);

ALTER TABLE Type ADD CONSTRAINT CK_Type_ResourceType CHECK (ResourceType IN ('T', 'B', 'G', 'A'));

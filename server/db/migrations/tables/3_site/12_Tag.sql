﻿# ---
# title: 12_Tag.sql
# name: Tag
# primaryKey: TagId
# ---

USE ldgr;

DROP TABLE IF EXISTS Tag;
CREATE TABLE Tag (
      TagId          int           NOT NULL AUTO_INCREMENT
    , Name           varchar(25)   NOT NULL
    , ColorId        int           NULL
    , date_created   datetime      NOT NULL  DEFAULT CURRENT_TIMESTAMP
    , created_by     int           NULL  DEFAULT NULL
    , date_modified  datetime      NOT NULL  DEFAULT CURRENT_TIMESTAMP
    , modified_by    int           NULL  DEFAULT NULL
    , UserId         int           NULL   DEFAULT NULL
    , CONSTRAINT PK_Tag_TagId PRIMARY KEY CLUSTERED (TagId)
) ENGINE=InnoDB AUTO_INCREMENT=1;

ALTER TABLE Tag ADD CONSTRAINT FK_Tag_ColorId FOREIGN KEY (ColorId) REFERENCES Color(ColorId);


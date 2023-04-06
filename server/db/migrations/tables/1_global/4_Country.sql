USE ldgr;

DROP TABLE IF EXISTS Country;
CREATE TABLE Country (
      CountryId    int           NOT NULL AUTO_INCREMENT
    , Alpha2Code   char(2)       NOT NULL
	, CountryCode  char(3)       NOT NULL
    , Name         varchar(100)  NOT NULL
    , CONSTRAINT PK_Country_CountryId PRIMARY KEY CLUSTERED (CountryId)
) ENGINE=InnoDB AUTO_INCREMENT=1;

ALTER TABLE Country ADD CONSTRAINT UQ_Country_Alpha2Code UNIQUE (Alpha2Code);

ALTER TABLE Country ADD CONSTRAINT UQ_Country_CountryCode UNIQUE (CountryCode);

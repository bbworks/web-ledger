USE ldgr;

DROP TABLE IF EXISTS LoginAttempt;
CREATE TABLE LoginAttempt (
      LoginAttemptId   int           NOT NULL AUTO_INCREMENT
    , UserName         varchar(50)   NOT NULL
    , PasswordHash     varchar(128)  NOT NULL
    , PasswordSalt     varchar(32)   NOT NULL
    , IpAddress        int           NULL
    , BrowserInfo      varchar(256)  NULL
    , wasSuccessful    boolean       NOT NULL
    , date_created     datetime      NOT NULL  DEFAULT CURRENT_TIMESTAMP
    , created_by       int           NULL  DEFAULT NULL
    , date_modified    datetime      NOT NULL  DEFAULT CURRENT_TIMESTAMP
    , modified_by      int           NULL  DEFAULT NULL
    , CONSTRAINT PK_LoginAttempt_LoginAttemptId PRIMARY KEY CLUSTERED (LoginAttemptId)
) ENGINE=InnoDB AUTO_INCREMENT=1;

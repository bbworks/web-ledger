# ---
# title: 9_UserLogin.sql
# name: UserLogin
# primaryKey: UserLoginId
# ---

USE ldgr;

DROP TABLE IF EXISTS UserLogin;
CREATE TABLE UserLogin (
      UserLoginId    int       NOT NULL AUTO_INCREMENT
    , UserId         int       NULL   DEFAULT NULL
    , LoginId        int       NOT NULL
    , date_created   datetime  NOT NULL  DEFAULT CURRENT_TIMESTAMP
    , created_by     int       NULL  DEFAULT NULL
    , date_modified  datetime  NOT NULL  DEFAULT CURRENT_TIMESTAMP
    , modified_by    int       NULL  DEFAULT NULL
    , CONSTRAINT PK_UserLogin_UserLoginId PRIMARY KEY CLUSTERED (UserLoginId)
) ENGINE=InnoDB AUTO_INCREMENT=1;

ALTER TABLE UserLogin ADD CONSTRAINT FK_UserLogin_UserId FOREIGN KEY (UserId) REFERENCES User(UserId);

ALTER TABLE UserLogin ADD CONSTRAINT FK_UserLogin_LoginId FOREIGN KEY (LoginId) REFERENCES Login(LoginId);


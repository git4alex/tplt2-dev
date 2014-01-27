CREATE TABLE IF NOT EXISTS SYS_USER(
    ID int IDENTITY PRIMARY KEY,
    ORG_ID int,
    LOGIN_NAME VARCHAR(64) NOT NULL,
    PASSWORD VARCHAR(64) NOT NULL,
    USER_NAME VARCHAR(64) NOT NULL,
    PHOTO VARCHAR(1024),
    EMAIL VARCHAR(200),
    MOBILE VARCHAR(32),
    REMARK VARCHAR(4000),
    LAST_LOGIN_DATE DATETIME,
    CDATE TIMESTAMP,
    MDATE TIMESTAMP AS NOW(),
    STATE int NOT NULL,
    DELETED VARCHAR(200)
);

CREATE TABLE IF NOT EXISTS SYS_ROLE(
    ID int IDENTITY PRIMARY KEY,
    NAME VARCHAR(64) NOT NULL,
    ROLE_CODE VARCHAR(64) NOT NULL,
    REMARK VARCHAR(200),
    CDATE DATETIME,
    MDATE DATETIME
);

CREATE TABLE IF NOT EXISTS SYS_PERMISSION(
    ID int IDENTITY PRIMARY KEY,
    PID int,
    CODE VARCHAR(128) NOT NULL,
    NAME VARCHAR(256) NOT NULL,
    TYPE VARCHAR(128),
    URLS text,
    REMARK VARCHAR(4000),
    ORDER_BY int,
    CDATE DATETIME,
    MDATE DATETIME
);

CREATE TABLE IF NOT EXISTS SYS_USER_ROLE(
    ID int IDENTITY PRIMARY KEY,
    USER_ID int NOT NULL,
    ROLE_ID int NOT NULL,
    CDATE DATETIME
);

CREATE TABLE IF NOT EXISTS SYS_ROLE_PERMISSION(
    ID int IDENTITY PRIMARY KEY,
    PERMISSION_ID int NOT NULL,
    ROLE_ID int NOT NULL,
    CDATE DATETIME
);

CREATE TABLE IF NOT EXISTS SYS_ORG(
    ID int IDENTITY PRIMARY KEY,
    CODE VARCHAR(1024) NOT NULL,
    NAME VARCHAR(1024) NOT NULL,
    FULL_NAME VARCHAR(1024),
    REMARK VARCHAR(4000),
    PID int,
    ORDER_BY int
);

CREATE TABLE IF NOT EXISTS SYS_USERGROUP(
    ID int IDENTITY,
    CODE VARCHAR(128) NOT NULL,
    NAME VARCHAR(128) NOT NULL,
    REMARK VARCHAR(2000),
    PRIMARY KEY(ID)
);

CREATE TABLE IF NOT EXISTS SYS_USER_GROUP(
    ID int IDENTITY PRIMARY KEY,
    UID int NOT NULL,
    GID int NOT NULL,
    CDATE DATETIME
);

CREATE TABLE IF NOT EXISTS SYS_UPLOAD(
    ID VARCHAR(64) PRIMARY KEY,
    NAME VARCHAR(512),
    CONTENT IMAGE,
    CDATE DATETIME
);

CREATE TABLE IF NOT EXISTS SYS_MODULE_HISTORY(
    ID int IDENTITY PRIMARY KEY,
    CODE VARCHAR(64) NOT NULL,
    NAME VARCHAR(128) NOT NULL,
    CONFIG text NOT NULL,
    XDS_CONFIG text NOT NULL,
    CATEGORY VARCHAR(128),
    AUTO_SAVE VARCHAR(50) NOT NULL,
    UPDATE_TIME DATETIME
);

CREATE TABLE IF NOT EXISTS SYS_MODULE(
    ID int IDENTITY PRIMARY KEY,
    CODE VARCHAR(64) NOT NULL,
    NAME VARCHAR(64) NOT NULL,
    CATEGORY VARCHAR(128),
    CONFIG text NOT NULL,
    XDS_CONFIG text NOT NULL
);

CREATE TABLE IF NOT EXISTS SYS_MENU(
    ID int IDENTITY PRIMARY KEY,
    PID int,
    NAME VARCHAR(64),
    XTYPE VARCHAR(32),
    MODULE_CODE VARCHAR(32),
    ORDER_BY int,
    REMARK VARCHAR(200),
    ICON_CLS VARCHAR(200),
    ENABLE bit,
    PERM_CODE VARCHAR(64),
    SHORTCUT bit
);

CREATE TABLE IF NOT EXISTS SYS_LOG_CONFIG(
    ID int IDENTITY PRIMARY KEY,
    NAME VARCHAR(32),
    MODULE_ID VARCHAR(32),
    REMARK VARCHAR(200),
    ENABLE bit,
    CDATE DATETIME,
    MDATE DATETIME
);

CREATE TABLE IF NOT EXISTS SYS_LOG(
    ID int IDENTITY PRIMARY KEY,
    USER_ID int,
    OPERATION VARCHAR(200),
    REMARK VARCHAR(200),
    CDATE DATETIME NOT NULL
);

CREATE TABLE IF NOT EXISTS SYS_BIZ_TYPE(
    ID int IDENTITY PRIMARY KEY,
    CODE VARCHAR(128),
    NAME VARCHAR(128) NOT NULL,
    IS_SYSTEM bit,
    CDATE DATETIME,
    REMARK VARCHAR(4000),
    PID int,
    ORDER_BY int
);

CREATE TABLE IF NOT EXISTS SYS_BIZ_CODE(
    ID int IDENTITY PRIMARY KEY,
    TYPE_CODE VARCHAR(64) NOT NULL,
    NAME VARCHAR(128) NOT NULL,
    VALUE VARCHAR(64) NOT NULL,
    REMARK VARCHAR(200) NULL,
    PID int,
    ORDER_BY int,
    CDATE DATETIME,
    MDATE DATETIME,
    ENABLE bit
);

CREATE TABLE IF NOT EXISTS SYS_AUTOGEN_SEED(
    ID int IDENTITY PRIMARY KEY,
    TYPE VARCHAR(50) NOT NULL,
    SEED int NOT NULL,
    SEED_LEN int,
    PATTERN VARCHAR(500)
);

CREATE TABLE IF NOT EXISTS SYS_ACL_RULE(
    ID int IDENTITY PRIMARY KEY,
    ENTITY_CODE VARCHAR(256) NOT NULL,
    USER_EXP VARCHAR(4000) NOT NULL,
    RULE_TYPE VARCHAR(256),
    FILTER_EXP VARCHAR(4000) NOT NULL,
    REMARK text,
    CODE VARCHAR(256),
    ENTITY_NAME VARCHAR(1024) NOT NULL,
    PRIORITY int
);

CREATE TABLE IF NOT EXISTS MD_FIELD(
    ID int IDENTITY PRIMARY KEY,
    CODE VARCHAR(64) NOT NULL,
    NAME VARCHAR(256) NOT NULL,
    ENTITY_ID int NOT NULL,
    ENTITY_CODE VARCHAR(64) NOT NULL,
    FIELD_NAME VARCHAR(200) NOT NULL,
    DATA_TYPE VARCHAR(64) NOT NULL,
    LENGTH int,
    PRIMARY_KEY bit,
    MANDATORY bit,
    PRECISION int,
    BIZ_TYPE VARCHAR(64),
    ORDER_BY int,
    REMARK VARCHAR(4000)
);

CREATE TABLE IF NOT EXISTS MD_ENTITY(
    ID int IDENTITY PRIMARY KEY,
    ENTITY_TYPE int,
    NAME VARCHAR(128) NOT NULL,
    CODE VARCHAR(128) NOT NULL,
    TABLE_NAME VARCHAR(64),
    ENTITY_ATTRIBUTE VARCHAR(200),
    DEL_FIELD VARCHAR(64),
    ALIAS_CODE VARCHAR(64),
    PID int,
    SEQ int NULL,
    REMARK VARCHAR(4000)
);

CREATE VIEW IF NOT EXISTS V_SYS_USER_ROLE AS
SELECT A.*,
       RU.ID AS CHECKED
FROM
    ( SELECT U.ID AS UID,
         R.ID AS RID,
         R.NAME AS ROLE_NAME,
         R.ROLE_CODE,
         R.REMARK AS ROLE_REMARK,
         U.USER_NAME,
         U.LOGIN_NAME,
         U.REMARK AS USER_REMARK
     FROM SYS_USER AS U,
          SYS_ROLE AS R) A
LEFT JOIN SYS_USER_ROLE AS RU ON A.UID=RU.USER_ID AND A.RID=RU.ROLE_ID;

CREATE VIEW IF NOT EXISTS V_SYS_USER_MENU AS
SELECT DISTINCT U.ID AS USERID,
    U.USER_NAME AS USERNAME,
    U.LOGIN_NAME AS LOGINNAME,
    U.EMAIL AS USEREMAIL,
    M.ID,
    M.NAME,
    M.PID,
    M.XTYPE,
    M.ORDER_BY AS ORDERBY,
    M.MODULE_CODE AS MODULEID,
    M.ICON_CLS AS ICON,
    M.REMARK AS REMARK,
    M.SHORTCUT AS SHORTCUT
FROM SYS_USER AS U
    INNER JOIN SYS_USER_ROLE AS UR ON U.ID = UR.USER_ID
    INNER JOIN SYS_ROLE AS R ON UR.ROLE_ID = R.ID
    INNER JOIN SYS_ROLE_PERMISSION AS RP ON R.ID = RP.ROLE_ID
    INNER JOIN SYS_PERMISSION AS P ON RP.PERMISSION_ID = P.ID
    INNER JOIN SYS_MENU AS M ON P.CODE = M.PERM_CODE;

CREATE VIEW IF NOT EXISTS V_SYS_USER_GROUP AS
SELECT A.*,
    UG.ID AS CHECKED
FROM
    (SELECT U.ID AS UID,
        G.ID AS GID,
        G.NAME AS NAME,
        G.CODE AS CODE,
        G.REMARK AS REMARK
    FROM SYS_USER AS U,
        SYS_USERGROUP AS G) A
    LEFT JOIN SYS_USER_GROUP AS UG ON A.UID=UG.UID AND A.GID=UG.GID;

CREATE VIEW V_SYS_USER AS
SELECT U.*,
       O.NAME AS ORGNAME,
       O.CODE AS ORGCODE
FROM SYS_USER U
INNER JOIN SYS_ORG O ON U.ORG_ID=O.ID
WHERE U.DELETED IS NULL;

CREATE VIEW V_SYS_ROLE_PERM_SET AS
SELECT A.*,
       RP.ID AS CHECKED
FROM
    ( SELECT P.ID AS PID,
             R.ID AS RID,
             R.NAME AS ROLENAME,
             R.ROLE_CODE AS ROLECODE,
             R.REMARK AS ROLEREMARK,
             P.NAME AS PERMNAME,
             P.CODE AS PERMCODE,
             P.REMARK AS PERMREMARK,
             P.ORDER_BY AS ORDERBY,
             P.PID AS PPID
     FROM SYS_ROLE AS R,
          SYS_PERMISSION AS P) A
LEFT JOIN SYS_ROLE_PERMISSION AS RP ON A.PID=RP.PERMISSION_ID
AND A.RID=RP.ROLE_ID;

CREATE VIEW V_SYS_ROLE_ALLOCATED AS
SELECT X.*,
       Y.ID AS ALLOCATED_ID,
       Y.CDATE AS ALLOCATED_CDATE
FROM
    ( SELECT A.ID AS USER_ID,
             B.*
     FROM SYS_USER A,
          SYS_ROLE B) X
LEFT JOIN SYS_USER_ROLE Y ON CAST(X.USER_ID AS VARCHAR(30)) + '-' + CAST(X.ID AS VARCHAR(30)) = CAST(Y.USER_ID AS VARCHAR(30)) + '-' + CAST(Y.ROLE_ID AS VARCHAR(30))
WHERE Y.ID IS NOT NULL;

CREATE VIEW V_SYS_ROLE_ALLOCATE AS
SELECT X.*,
       Y.ID AS ALLOCATED_ID,
       Y.CDATE AS ALLOCATED_CDATE
FROM
    ( SELECT A.ID AS USER_ID,
             B.*
     FROM SYS_USER A,
          SYS_ROLE B) X
LEFT JOIN SYS_USER_ROLE Y ON CAST(X.USER_ID AS VARCHAR(30)) + '-' + CAST(X.ID AS VARCHAR(30)) = CAST(Y.USER_ID AS VARCHAR(30)) + '-' + CAST(Y.ROLE_ID AS VARCHAR(30))
WHERE Y.ID IS NULL;

CREATE VIEW V_SYS_PERMISSION AS
SELECT X.*,
       CASE
           WHEN Y.ROLE_ID IS NOT NULL THEN 1
           ELSE 0
       END AS CHECKED
FROM
    (SELECT A.ID AS ROLE_ID,
            B.*
     FROM SYS_ROLE A,
          SYS_PERMISSION B) X
LEFT JOIN SYS_ROLE_PERMISSION Y ON X.ROLE_ID + '-' + X.ID = Y.ROLE_ID + '-' + Y.PERMISSION_ID;

CREATE VIEW V_SYS_LOG AS
SELECT A.*,
       B.LOGIN_NAME,
       B.USER_NAME
FROM SYS_LOG A,
     SYS_USER B WHERE A.USER_ID = B.ID;

CREATE VIEW V_SYS_CONFIG AS
SELECT 'module' AS TYPE,
       'module-'+CONVERT(ID,VARCHAR(64)) AS CFG_ID,
       ID,
       NAME,
       CODE,
       CATEGORY AS REMARK
FROM SYS_MODULE
UNION
SELECT 'entity' AS TYPE,
       'entity-'+CONVERT(ID,VARCHAR(64)) AS CFG_ID,
       ID,
       NAME,
       CODE,
       TABLE_NAME AS REMARK
FROM MD_ENTITY;


insert into SYS_USER (org_id,login_name,password,user_name,state,email) values(1,'admin','977a97ba700688034c2696e422be61ed','系统管理员',1,'admin@delta.org')
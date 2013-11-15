package org.delta.core.utils;

import org.apache.commons.lang.StringUtils;
import org.apache.log4j.Logger;

import javax.sql.DataSource;
import java.sql.Connection;
import java.sql.DatabaseMetaData;
import java.sql.ResultSet;
import java.sql.SQLException;

/**
 * User: Alex
 * Date: 13-9-28
 * Time: 下午2:56
 */
public class DbSchemaUtil {
    private static Logger logger = Logger.getLogger(DbSchemaUtil.class.getName());

    /**
     * 检查系统表是否存在
     * @param ds DataSource instance
     */
    public static void checkDatabaseSchema(DataSource ds) {
        Connection connection = null;
        try {
            connection = ds.getConnection();
            DatabaseMetaData databaseMetaData = connection.getMetaData();
            String databaseType = databaseMetaData.getDatabaseProductName();
            logger.info("Database product name:" + databaseType);

            String catalog = connection.getCatalog();
            logger.info("Connection catalog:" + catalog);

            //method "getSchema" defined in jdk1.7
//            String schema = connection.getSchema();
//            logger.info("Connection schema:" + schema);

            ResultSet rs = databaseMetaData.getTables(catalog, null, "MD_ENTITY", new String[]{"TABLE"});

            if (!rs.next()) {
                logger.info("Tplt tables not exists");
            }else{
                logger.info("Tplt tables already exists");
            }
        } catch (SQLException e) {
            e.printStackTrace();
        } finally {
            if (connection != null) {
                try {
                    connection.close();
                } catch (SQLException e) {
                    e.printStackTrace();
                }
            }
        }
    }

    /**
     * 获取指定数据库类型的默认schema
     *
     * @param dbType 数据库类型
     * @return 默认schema
     */
    public static String getDefaultSchema(String dbType){
        if(StringUtils.equalsIgnoreCase(dbType,"H2")){
            return "PUBLIC";
        }else if(StringUtils.equalsIgnoreCase(dbType,"Microsoft SQL Server")){
            return "PUBLIC";
        }else{
            return "";
        }
    }
}

package org.delta.core.utils;

import org.apache.commons.lang.StringUtils;
import org.apache.log4j.Logger;
import org.springframework.core.io.InputStreamResource;
import org.springframework.jdbc.datasource.init.ResourceDatabasePopulator;
import org.springframework.util.Assert;

import javax.sql.DataSource;
import java.io.InputStream;
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
                ResourceDatabasePopulator populator = new ResourceDatabasePopulator();

                String scriptPath = getScriptPath(databaseType);
                Assert.hasLength(scriptPath,"Get script path error for databaseType:"+databaseType);

                String schemaScript = scriptPath+"schema.org.delta.system.service.sql";
                InputStream schemaIs = DbSchemaUtil.class.getClassLoader().getResourceAsStream(schemaScript);
                populator.addScript(new InputStreamResource(schemaIs));

                String initScript = scriptPath+"init.org.delta.system.service.sql";
                InputStream initIs = DbSchemaUtil.class.getClassLoader().getResourceAsStream(initScript);
                populator.addScript(new InputStreamResource(initIs));

                populator.setSqlScriptEncoding("UTF-8");
                populator.setContinueOnError(true);
                populator.setIgnoreFailedDrops(true);

                populator.populate(connection);
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
//    public static String getDefaultSchema(String dbType){
//        if(StringUtils.equalsIgnoreCase(dbType,"H2")){
//            return "PUBLIC";
//        }else if(StringUtils.equalsIgnoreCase(dbType,"Microsoft SQL Server")){
//            return "PUBLIC";
//        }else{
//            return "";
//        }
//    }

    private static String getScriptPath(String dbType){
        if(StringUtils.equalsIgnoreCase(dbType,"H2")){
            return "org.delta.core.db.h2.";
        }else if(StringUtils.equalsIgnoreCase(dbType,"Microsoft SQL Server")){
            return "org.delta.core.db.mssql.";
        }else{
            return "";
        }
    }
}

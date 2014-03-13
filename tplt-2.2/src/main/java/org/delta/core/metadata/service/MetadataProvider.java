package org.delta.core.metadata.service;

import org.apache.commons.collections.CollectionUtils;
import org.apache.commons.collections.MapUtils;
import org.apache.commons.lang.StringUtils;
import org.apache.log4j.Logger;
import org.delta.core.dao.Dao;
import org.delta.core.dao.Filter;
import org.delta.core.entity.service.EntityService;
import org.delta.core.exception.BusinessException;
import org.delta.core.metadata.EntityMetadata;
import org.delta.core.metadata.FieldMetadata;
import org.delta.core.metadata.MetadataConst;
import org.delta.core.metadata.XmlMetadataProvider;
import org.delta.core.utils.ValueMap;
import org.delta.utils.TpltUtils;
import org.springframework.jdbc.core.metadata.TableMetaDataContext;
import org.springframework.jdbc.core.metadata.TableMetaDataProvider;
import org.springframework.jdbc.core.metadata.TableMetaDataProviderFactory;
import org.springframework.jdbc.core.metadata.TableParameterMetaData;
import org.springframework.stereotype.Service;

import javax.annotation.Resource;
import java.sql.Connection;
import java.sql.DatabaseMetaData;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * date: 2010-7-20
 * <p/>
 * version: 1.0 commonts: ......
 */
@Service
public class MetadataProvider {
    private static Logger logger = Logger.getLogger(MetadataProvider.class);
    @Resource
    private Dao dao;
    @Resource
    private EntityService entityService;
    @Resource
    private XmlMetadataProvider xmlMetadataProvider;

    private Map<String, EntityMetadata> entitymetadataMap = new HashMap<>();

    public void clearMetadataCache() {
        entitymetadataMap.clear();
        logger.info("元数据缓存已经清除");
    }

    /**
     * 获取实体元数据
     *
     * @param code 实体编码
     * @return 实体元数据
     * @throws BusinessException
     */
    public EntityMetadata getEntityMetadata(String code) throws BusinessException {
        //从缓存中获取
        EntityMetadata metadata = entitymetadataMap.get(code);
        if (metadata == null) {
            //从xml定义中获取
            metadata = xmlMetadataProvider.getEntityMetadata(code);
            if (metadata == null) {
                //从数据库获取
                metadata = getEntityMetadataFromDB(code);
            }

            if (metadata == null) {
                metadata = genMetadataFromDb(code);
            }

            if (metadata == null) {
                throw new BusinessException("未找到实体元数据。code:" + code);
            }

            if (CollectionUtils.isEmpty(metadata.getFields())) {
                logger.warn("实体属性为空。code:" + code);
            }

            //缓存
            entitymetadataMap.put(code, metadata);
        }
        return metadata;
    }

    /**
     * 根据表结构自动生成元数据
     *
     * @param code 实体编码
     * @return 实体元数据
     */
    private EntityMetadata genMetadataFromDb(String code) {
        try {
            Connection con = dao.getDataSource().getConnection();
            DatabaseMetaData dbMetadata = con.getMetaData();
            String c, s = null;
            c = con.getCatalog();
            //todo:getSchema异常
//          s = con.getSchema();
            ResultSet tables = dbMetadata.getTables(c, s, code, new String[]{"TABLE"});
            if (tables.next()) {
                EntityMetadata em = new EntityMetadata();
                em.setTableName(code);
                em.setName(code);
                ResultSet keys = dbMetadata.getPrimaryKeys(c, s, code);
                String keyCode = "";
                if (keys.next()) {
                    keyCode = keys.getString("COLUMN_NAME");
                }

                ResultSet columns = dbMetadata.getColumns(c, s, code, null);

                while (columns.next()) {
                    FieldMetadata fm = new FieldMetadata();
                    String colName = columns.getString("COLUMN_NAME");
                    fm.setName(colName);
                    fm.setColumnName(colName);
                    fm.setCode(upcase2camel(colName));
                    fm.setDataType(TpltUtils.getSystemDataType(columns.getType()).toString());
                    fm.setLength(columns.getInt("COLUMN_SIZE"));
                    String nullable = columns.getString("IS_NULLABLE");
                    if ("NO".equalsIgnoreCase(nullable)) {
                        fm.setMandatory(true);
                    }
                    if (keyCode.equalsIgnoreCase(colName)) {
                        fm.setMandatory(false);
                        fm.setPrimaryKey(true);
                    }
                    em.addField(fm);
                }

                return em;
            } else {
                ResultSet views = dbMetadata.getTables(c, s, code, new String[]{"VIEW"});
                if (views.next()) {
                    EntityMetadata em = new EntityMetadata();
                    em.setName(code);
                    em.setCode(code);

                    ResultSet columns = dbMetadata.getColumns(c, s, code, null);

                    while (columns.next()) {
                        FieldMetadata fm = new FieldMetadata();
                        String colName = columns.getString("COLUMN_NAME");
                        fm.setName(colName);
                        fm.setColumnName(colName);
                        fm.setCode(upcase2camel(colName));
                        fm.setDataType(TpltUtils.getSystemDataType(columns.getType()).toString());
                        fm.setLength(columns.getInt("COLUMN_SIZE"));

                        em.addField(fm);
                    }
                    return em;
                }
            }
        } catch (Exception e) {
            logger.debug(e);
        }

        return null;
    }

    /**
     * 从数据库中加载实体元数据
     *
     * @param code 实体编码
     * @return 实体元数据
     * @throws BusinessException
     */
    private EntityMetadata getEntityMetadataFromDB(String code) throws BusinessException {
        //用实体编码查询实体记录
        ValueMap entity = entityService.get(MetadataConst.CODE_ENTITY_METADATA,
                Filter.field(MetadataConst.EntityMetadataField.code.toString()).eq(code));

        //用别名查询实体记录
        if (MapUtils.isEmpty(entity)) {
            entity = entityService.get(MetadataConst.CODE_ENTITY_METADATA, Filter.field("aliasCode").like(code));
            if (entity != null) {
                String actCode = MapUtils.getString(entity, MetadataConst.EntityMetadataField.code);
                entity.put("code", code);
                code = actCode;
            }
        }

        //加载实体属性
        if (MapUtils.isNotEmpty(entity)) {
            EntityMetadata metadata = new EntityMetadata(entity);
            List<ValueMap> fieldList = entityService.list(MetadataConst.CODE_FIELD_METADATA,
                    Filter.field(MetadataConst.FieldMetadataField.entityCode.toString()).eq(code));
            for (ValueMap field : fieldList) {
                FieldMetadata fm = new FieldMetadata(field);
                metadata.addField(fm);
            }
            return metadata;
        }

        return null;
    }

    /**
     * 将表字段元数据转化为实体属性元数据
     *
     * @param tableName 表名
     * @return [{columnName:'',code:'',dataType:'',mandatory:false}]
     * @throws BusinessException
     */
    public List<ValueMap> loadColumsFromDbMetadata(String tableName) throws BusinessException {
        List<ValueMap> fieldList = new ArrayList<>();
        try {
            List<TableParameterMetaData> columnList = getTableColumnsFromDB(tableName);
            for (TableParameterMetaData dbMetadata : columnList) {
                String columnName = dbMetadata.getParameterName();
                ValueMap field = new ValueMap();
                field.put(MetadataConst.FieldMetadataField.columnName.toString(), columnName);
                field.put(MetadataConst.FieldMetadataField.code.toString(), upcase2camel(columnName));
                field.put(MetadataConst.FieldMetadataField.dataType.toString(), TpltUtils.getSystemDataType(dbMetadata.getSqlType()).toString());
                field.put(MetadataConst.FieldMetadataField.mandatory.toString(), dbMetadata.isNullable());
                fieldList.add(field);
            }
        } catch (SQLException e) {
            e.printStackTrace();
            logger.error(e.getMessage(), e);
            throw new BusinessException(e.getMessage());
        }

        return fieldList;
    }

    /**
     * 将下划线分割的字段名转换为驼峰命名
     *
     * @param columnName 字段名
     * @return 驼峰命名
     */
    private String upcase2camel(String columnName) {
        if (StringUtils.isBlank(columnName)) {
            return "";
        }
        String lc = columnName.toLowerCase();
        if (!columnName.contains("_")) {
            return lc;
        }

        String camels[] = columnName.split("_");
        StringBuilder result = new StringBuilder();
        for (String camel : camels) {
            if (camel.isEmpty()) {
                continue;
            }
            if (result.length() == 0) {
                result.append(camel.toLowerCase());
            } else {
                result.append(camel.substring(0, 1).toUpperCase());
                result.append(camel.substring(1).toLowerCase());
            }
        }
        return result.toString();
    }

    /**
     * 从数据库读取字段列表
     *
     * @param tableName 表名
     * @return 表元数据
     * @throws SQLException
     */
    private List<TableParameterMetaData> getTableColumnsFromDB(String tableName) throws SQLException {
        TableMetaDataContext context = new TableMetaDataContext();
        context.setAccessTableColumnMetaData(true);
        context.setTableName(tableName);
        TableMetaDataProvider metaDataProvider = TableMetaDataProviderFactory.createMetaDataProvider(dao.getDataSource(), context);
        return metaDataProvider.getTableParameterMetaData();
    }
}

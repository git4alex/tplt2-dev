package org.delta.core.metadata.service;

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
import org.apache.commons.collections.CollectionUtils;
import org.apache.commons.collections.MapUtils;
import org.apache.log4j.Logger;
import org.springframework.jdbc.core.metadata.TableMetaDataContext;
import org.springframework.jdbc.core.metadata.TableMetaDataProvider;
import org.springframework.jdbc.core.metadata.TableMetaDataProviderFactory;
import org.springframework.jdbc.core.metadata.TableParameterMetaData;
import org.springframework.stereotype.Service;

import javax.annotation.Resource;
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

    private Map<String, EntityMetadata> entitymetadataMap = new HashMap<String, EntityMetadata>();

    public void clearMetadataCache() {
        entitymetadataMap.clear();
        logger.info("元数据缓存已经清除");
    }

    public EntityMetadata getEntityMetadata(String code) throws BusinessException {
        EntityMetadata metadata = entitymetadataMap.get(code);
        if (metadata == null) {
            metadata = xmlMetadataProvider.getEntityMetadata(code);
            if (metadata == null) {
                metadata = getEntityMetadataFromDB(code);
            }
            if (metadata == null) {
                throw new BusinessException("未找到实体元数据。code:" + code);
            }
            if (CollectionUtils.isEmpty(metadata.getFields())) {
                logger.warn("实体属性为空。code:" + code);
            }

            entitymetadataMap.put(code, metadata);
        }
        return metadata;
    }

    private EntityMetadata getEntityMetadataFromDB(String code) throws BusinessException {
//        ValueMap entity = entityService.getById(MetadataConst.CODE_ENTITY_METADATA, code);
        ValueMap entity = entityService.get(MetadataConst.CODE_ENTITY_METADATA, Filter.field(MetadataConst.EntityMetadataField.code.toString()).eq(code));
        if (MapUtils.isEmpty(entity)) {
            entity = entityService.get(MetadataConst.CODE_ENTITY_METADATA, Filter.field("aliasCode").like(code));
            String actCode = MapUtils.getString(entity, MetadataConst.EntityMetadataField.code);
            entity.put("code", code);
            code = actCode;
        }

        if (MapUtils.isNotEmpty(entity)) {
            EntityMetadata metadata = new EntityMetadata(entity);
            List<ValueMap> fieldList = entityService.list(MetadataConst.CODE_FIELD_METADATA, Filter.field(MetadataConst.FieldMetadataField.entityCode.toString()).eq(code), null);
            for (ValueMap field : fieldList) {
                FieldMetadata fm = new FieldMetadata(field);
                metadata.addField(fm);
            }
            return metadata;
        }
        return null;
    }

    public List<ValueMap> loadColumsFromDbMetadata(String entityCode) throws BusinessException {
        List<ValueMap> fieldList = new ArrayList<ValueMap>();
        try {
            List<TableParameterMetaData> columnList = getTableColumnsFromDB(entityCode);
            for (TableParameterMetaData dbMetadata : columnList) {
                String columnName = dbMetadata.getParameterName();
                ValueMap field = new ValueMap();
                field.put(MetadataConst.FieldMetadataField.columnName.toString(), columnName);
                field.put(MetadataConst.FieldMetadataField.code.toString(), getFieldCode(columnName));
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

    private String getFieldCode(String columnName) {
        try {
            String s = columnName.toLowerCase();
            int index = s.indexOf("_");
            String s1, s2;
            for (int i = 0; index > 0; i++) {
                if (i == 10) {
                    throw new Exception();
                }
                if (s.length() > index + 1) {
                    s1 = s.substring(index + 1, index + 2);
                    s1 = s1.toUpperCase();
                    s2 = s.substring(index, index + 2);
                } else {
                    s1 = "";
                    s2 = "_";
                }
                s = s.replace(s2, s1);
                index = s.indexOf("_");
            }
            return s;
        } catch (Exception e) {
        }
        return columnName;
    }

    private List<TableParameterMetaData> getTableColumnsFromDB(String tableName) throws SQLException {
        TableMetaDataContext context = new TableMetaDataContext();
        context.setAccessTableColumnMetaData(true);
        context.setTableName(tableName);
        TableMetaDataProvider metaDataProvider = TableMetaDataProviderFactory.createMetaDataProvider(dao.getDataSource(), context);
        return metaDataProvider.getTableParameterMetaData();
    }
}

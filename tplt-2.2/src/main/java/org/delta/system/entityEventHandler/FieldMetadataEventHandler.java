package org.delta.system.entityEventHandler;

import org.apache.commons.collections.MapUtils;
import org.delta.core.entity.EntityEventListener;
import org.delta.core.entity.service.EntityService;
import org.delta.core.exception.BusinessException;
import org.delta.core.metadata.MetadataConst;
import org.delta.core.utils.ValueMap;
import org.springframework.stereotype.Component;

import javax.annotation.Resource;
import javax.sql.DataSource;

@Component
public class FieldMetadataEventHandler extends EntityEventListener {
    @Resource
    private DataSource dataSource;

    @Resource
    private EntityService entityService;

    public boolean accept(String entityCode) {
        return MetadataConst.CODE_FIELD_METADATA.equalsIgnoreCase(entityCode);
    }

    @Override
    public void beforeCreate(Object dt) throws BusinessException {
        ValueMap data = (ValueMap) dt;
        boolean createDbCol = MapUtils.getBooleanValue(data, "createDbCol",false);
        if (createDbCol) {
//            String entityCode = MapUtils.getString(data, MetadataConst.FieldMetadataField.entityCode.toString());
//            if (StringUtils.isBlank(entityCode)) {
//                throw new BusinessException("数据库字段时entityCode为空");
//            }
//
//            ValueMap entityMetadata = entityService.get(MetadataConst.CODE_ENTITY_METADATA, Filter.field(MetadataConst.EntityMetadataField.code.toString()).eq(entityCode));
//            String tabName = MapUtils.getString(entityMetadata, MetadataConst.EntityMetadataField.tableName.toString());
//            if (StringUtils.isBlank(tabName)) {
//                throw new BusinessException("创建数据库字段时表名为空");
//            }
//
//            Platform p = PlatformFactory.createNewPlatformInstance(dataSource);
//            Database db = p.readModelFromDatabase(null);
//            Table tab = db.findTable(tabName);
//
//            if (tab == null) {
//                throw new BusinessException("创建数据库字段时表 "+tabName+" 不存在");
//            }
//
//            Column col = new Column();
//            String colName = MapUtils.getString(data, MetadataConst.FieldMetadataField.columnName.toString());
//            if (StringUtils.isBlank(colName)) {
//                throw new BusinessException("创建数据库字段时列名为空");
//            }
//
//            col.setName(colName);
//
//            int sqlType = DataTypeConverter.getSqlType(MapUtils.getString(data, MetadataConst.FieldMetadataField.dataType.toString(), "string"));
//            col.setTypeCode(sqlType);
//            if (sqlType == Types.VARCHAR) {
//                col.setSize(MapUtils.getString(data, "length", "256"));
//            } else if (sqlType == Types.NUMERIC) {
//                int size = MapUtils.getIntValue(data, "length", 18);
//                int scale = MapUtils.getIntValue(data, "precision", 4);
//                col.setSizeAndScale(size, scale);
//            }
//            col.setRequired(MapUtils.getBooleanValue(data, MetadataConst.FieldMetadataField.mandatory.toString(), false));
//
//            boolean pk = MapUtils.getBooleanValue(data, MetadataConst.FieldMetadataField.primaryKey.toString(), false);
//            col.setPrimaryKey(pk);
//            col.setAutoIncrement(pk);
//
//            tab.addColumn(col);
//
//            p.alterTables(db, false);
        }
    }
}

package org.delta.system.entityEventHandler;

import org.apache.commons.collections.MapUtils;
import org.apache.commons.lang.StringUtils;
import org.apache.log4j.Logger;
import org.delta.core.dao.Filter;
import org.delta.core.dao.OrderBy;
import org.delta.core.entity.EntityEventListener;
import org.delta.core.entity.service.EntityService;
import org.delta.core.exception.BusinessException;
import org.delta.core.metadata.MetadataConst;
import org.delta.core.metadata.MetadataConst.DataType;
import org.delta.core.utils.ValueMap;
import org.springframework.stereotype.Component;

import javax.annotation.Resource;
import javax.sql.DataSource;
import java.util.List;

@Component
public class EntityMetadataEventHandler extends EntityEventListener {
    private Logger logger = Logger.getLogger(this.getClass());

    @Resource
    private DataSource dataSource;
    @Resource
    private EntityService entityService;

    public boolean accept(String entityCode) {
        return "entity".equalsIgnoreCase(entityCode);
    }

    public void afterCreate(Object data) throws BusinessException {
        ValueMap vm = (ValueMap) data;
        boolean createTable = MapUtils.getBooleanValue(vm, "createTable", false);
        boolean isDuplicate = MapUtils.getBooleanValue(vm, "isDuplicate", false);
        if (isDuplicate) {
            String srcEntityCode = MapUtils.getString(vm, "srcEntityCode");
            if(StringUtils.isBlank(srcEntityCode)){
                throw new BusinessException("复制实体时源实体编码不能为空");
            }
            String entityCode = MapUtils.getString(vm, MetadataConst.EntityMetadataField.code.toString());
            List<ValueMap> fields = entityService.list(MetadataConst.CODE_FIELD_METADATA, Filter.field(MetadataConst.FieldMetadataField.entityCode.toString()).eq(srcEntityCode),new OrderBy().asc(MetadataConst.FieldMetadataField.id.toString()));
            for (ValueMap field : fields) {
                field.put(MetadataConst.FieldMetadataField.entityCode.toString(), entityCode);
                field.remove(MetadataConst.FieldMetadataField.id.toString());
                entityService.create(MetadataConst.CODE_FIELD_METADATA, field);
            }
        } else if (createTable) {
            String tabName = MapUtils.getString(vm, MetadataConst.EntityMetadataField.tableName.toString());
            if (StringUtils.isBlank(tabName)) {
                throw new BusinessException("table name is blank");
            }
//            createTable(tabName, vm);
            logger.debug("create table:" + tabName);
        }
    }

//    private void createTable(String tabName, ValueMap data) {
//        Platform platform = PlatformFactory.createNewPlatformInstance(dataSource);
//
//        Database db = new Database();
//
//        Table tab = new Table();
//        tab.setName(tabName);
//
//        Column idCol = new Column();
//        idCol.setName("ID");
//        idCol.setTypeCode(Types.INTEGER);
//        idCol.setPrimaryKey(true);
//        idCol.setAutoIncrement(true);
//        tab.addColumn(idCol);
//        String delFlag = MapUtils.getString(data, "delField");
//        if (StringUtils.isNotBlank(delFlag)) {
//            Column delFlagCol = new Column();
//            delFlagCol.setName(delFlag);
//            delFlagCol.setTypeCode(Types.BIT);
//            tab.addColumn(delFlagCol);
//            createDelFlagPropery(MapUtils.getString(data, "id"), delFlag);
//        }
//
//        db.addTable(tab);
//        platform.createTables(db, false, true);
//
//        createDefaultIdProperty(MapUtils.getString(data, "id"));
//    }

    private void createDefaultIdProperty(String entityCode) {
        ValueMap prop = new ValueMap();
        prop.put("entityCode", entityCode);
        prop.put("code", "id");
        prop.put("name", "ID");
        prop.put("columnName", "ID");
        prop.put("dataType", DataType.DATATYPE_INTEGER);
        prop.put("primaryKey", true);
        prop.put("mandatory", true);
        entityService.create(MetadataConst.CODE_FIELD_METADATA, prop);
    }

    private void createDelFlagPropery(String entityCode, String delFlag) {
        ValueMap prop = new ValueMap();
        prop.put("entityCode", entityCode);
        prop.put("code", "delFlag");
        prop.put("name", "删除标记");
        prop.put("columnName", delFlag);
        prop.put("dataType", DataType.DATATYPE_BOOLEAN);
        prop.put("primaryKey", false);
        prop.put("mandatory", false);
        entityService.create(MetadataConst.CODE_FIELD_METADATA, prop);
    }

    public void beforeDelete(Object data) throws BusinessException {
        Filter f = (Filter) data;
        List<ValueMap> entityList = entityService.list(MetadataConst.CODE_ENTITY_METADATA,f);
        for(ValueMap vm:entityList){
            String entityCode = MapUtils.getString(vm, MetadataConst.EntityMetadataField.code.toString());
            entityService.delete(MetadataConst.CODE_FIELD_METADATA, Filter.field(MetadataConst.FieldMetadataField.entityCode.toString()).eq(entityCode));
        }
    }
}

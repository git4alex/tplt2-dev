package org.delta.core.metadata;

import org.apache.commons.collections.MapUtils;
import org.apache.commons.lang.StringUtils;
import org.apache.log4j.Logger;
import org.delta.core.exception.BusinessException;
import org.delta.core.metadata.MetadataConst.EntityMetadataField;
import org.delta.core.utils.ValueMap;

import java.util.ArrayList;
import java.util.List;

public class EntityMetadata {
    private Logger logger = Logger.getLogger(EntityMetadata.class);
    private String pkCode;
    private String name;
    private String code;
    private String tableName;
    private String deletedCode;
    private List<FieldMetadata> fieldList = new ArrayList<FieldMetadata>();

    public EntityMetadata() {

    }

    public EntityMetadata(ValueMap map) {
        setName(MapUtils.getString(map, EntityMetadataField.name.toString()));
        setCode(MapUtils.getString(map, EntityMetadataField.code.toString()));
        setTableName(MapUtils.getString(map, EntityMetadataField.tableName.toString()));
        setDeletedCode(MapUtils.getString(map, EntityMetadataField.delField.toString()));
    }

    public void addField(FieldMetadata field) throws BusinessException {
        if (field.isPrimaryKey()) {
            if (StringUtils.isNotBlank(pkCode)) {
                throw new BusinessException("主键重复");
            } else {
                pkCode = field.getCode();
            }
        }

        fieldList.add(field);
    }

    public FieldMetadata getFieldMetadataByFieldCode(String fieldCode){
        for(FieldMetadata fm:fieldList){
            if(fm.getCode().equalsIgnoreCase(fieldCode)){
                return fm;
            }
        }
        return null;
    }

    public FieldMetadata getFieldMetadataByTableColumn(String colName){
        for(FieldMetadata fm:fieldList){
            if(fm.getColumnName().equalsIgnoreCase(colName)){
                return fm;
            }
        }
        return null;
    }

    public List<String> getColumnNames() {
        List<String> fields = new ArrayList<String>();
        for (FieldMetadata metadata : fieldList) {
            fields.add(metadata.getColumnName());
        }

        return fields;
    }

    public List<String> getFieldCodes() {
        List<String> codes = new ArrayList<String>();
        for (FieldMetadata metadata : fieldList) {
            codes.add(metadata.getCode());
        }

        return codes;
    }

    public ValueMap getFieldColumnMap(){
        ValueMap ret = new ValueMap();
        for(FieldMetadata fm:fieldList){
            ret.put(fm.getCode(),fm.getColumnName());
        }
        return ret;
    }

    public String getCode() {
        return code;
    }

    public void setCode(String code) {
        this.code = code;
    }

    public void setFieldList(List<FieldMetadata> fieldList) {
        this.fieldList = fieldList;
    }

    public String getPkCode() {
        return pkCode;
    }

    public void setPkCode(String pkCode) {
        this.pkCode = pkCode;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getTableName() {
        return tableName;
    }

    public void setTableName(String tableName) {
        this.tableName = tableName;
    }

    public String getDelCode() {
        return deletedCode;
    }

    public void setDeletedCode(String deletedCode) {
        this.deletedCode = deletedCode;
    }

    public List<FieldMetadata> getFieldList(){
        return this.fieldList;
    }
}



package org.delta.core.metadata;

import org.delta.core.utils.ValueMap;
import org.delta.core.metadata.MetadataConst.DataType;
import org.apache.commons.collections.MapUtils;


/**
 * date: 2010-7-30
 *
 * version: 1.0
 * commonts: ......
 */
public class FieldMetadata {
	private String name;
	private String code;
	private String columnName;
	private String dataType;
	private String bizTypeCode;
	private Integer length;
	private boolean primaryKey;
	private boolean mandatory;

	public FieldMetadata(){

	}

	public FieldMetadata(ValueMap params){
		setName(MapUtils.getString(params, MetadataConst.FieldMetadataField.name.toString()));
		setCode(MapUtils.getString(params, MetadataConst.FieldMetadataField.code.toString()));
		setColumnName(MapUtils.getString(params, MetadataConst.FieldMetadataField.columnName.toString()));
		setDataType(MapUtils.getString(params, MetadataConst.FieldMetadataField.dataType.toString()));
		setLength(MapUtils.getInteger(params, MetadataConst.FieldMetadataField.length.toString(), null));
		setPrimaryKey(MapUtils.getBooleanValue(params, MetadataConst.FieldMetadataField.primaryKey.toString()));
		setMandatory(MapUtils.getBooleanValue(params, MetadataConst.FieldMetadataField.mandatory.toString()));
        setBizTypeCode(MapUtils.getString(params, MetadataConst.FieldMetadataField.bizTypeCode.toString()));
	}

	public String getCode() {
		return code;
	}
	public void setCode(String code) {
		this.code = code;
	}
	public String getDataType() {
		return dataType;
	}

    public DataType getFieldDataType(){
        return DataType.get(this.dataType);
    }

	public void setDataType(String dataType) {
		this.dataType = dataType;
	}
	public String getColumnName() {
		return columnName;
	}

	public void setColumnName(String columnName) {
		this.columnName = columnName;
	}
	public boolean isMandatory() {
		return mandatory;
	}
	public void setMandatory(boolean mandatory) {
		this.mandatory = mandatory;
	}
	public boolean isPrimaryKey() {
		return primaryKey;
	}
	public void setPrimaryKey(boolean primaryKey) {
		this.primaryKey = primaryKey;
	}
	public Integer getLength() {
		return length;
	}
	public void setLength(int length) {
		this.length = length;
	}
	public void setLength(Integer length) {
		this.length = length;
	}
	public String getName() {
		return name;
	}
	public void setName(String name) {
		this.name = name;
	}
	public String getBizTypeCode() {
		return bizTypeCode;
	}
	public void setBizTypeCode(String bizTypeCode) {
		this.bizTypeCode = bizTypeCode;
	}

}



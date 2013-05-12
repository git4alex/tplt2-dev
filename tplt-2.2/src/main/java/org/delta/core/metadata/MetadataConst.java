package org.delta.core.metadata;



/**
 * date: 2010-7-20
 *
 * version: 1.0
 * commonts: ......
 */
public class MetadataConst {
	public static final String ID = "ID";
	public static final String ENTITY_METADATA_ID = "id";
    public static final String GENERATED_KEY = "generatedKey";

    public static final String CODE_ENTITY_METADATA = "entity";
    public static final String CODE_FIELD_METADATA = "field";

	public enum EntityMetadataField {
		name,
		code,
		aliasCode,
		tableName,
		entityType,
		entityAttribute,
		delField
	}

	public enum FieldMetadataField {
        id,
		entityCode,
		name,
		code,
		columnName,
		dataType,
		length,
		precision,
		primaryKey,
		mandatory,
        bizTypeCode,
		orderBy
	}

	public enum DataType {
		DATATYPE_FLOAT("float"),
		DATATYPE_INTEGER("integer"),
		DATATYPE_BOOLEAN("boolean"),
		DATATYPE_STRING("string"),
		DATATYPE_IMAGE("image"),
		DATATYPE_DBDEFAULT("dbdefault"),
		DATATYPE_TIMESTAMP("timestamp"),
		DATATYPE_UID("uid"),
		DATATYPE_UNAME("uname"),
		DATATYPE_ORG_ID("orgId"),
		DATATYPE_ORG_NAME("orgName"),
        DATATYPE_AUTO_GEN("autoGen"),
        DATATYPE_DATETIME("datetime");

		private String dataType;
		private DataType(String dataType) {
			this.dataType = dataType;
		}

		public String toString() {
			return this.dataType;
		}

        public static DataType get(String s) {
            for(DataType dt : DataType.values()){
                if(dt.toString().equalsIgnoreCase(s)){
                    return dt;
                }
            }

            throw new RuntimeException("数据类型："+s+"  不存在");
        }
	}
}
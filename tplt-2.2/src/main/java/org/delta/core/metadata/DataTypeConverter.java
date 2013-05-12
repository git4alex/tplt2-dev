package org.delta.core.metadata;

import org.delta.core.utils.ValueMap;
import org.apache.commons.collections.MapUtils;

import java.sql.Types;

public class DataTypeConverter {
    private static final ValueMap reg = new ValueMap();
    static {
        reg.put("string", Types.VARCHAR);
        reg.put("integer", Types.INTEGER);
        reg.put("float", Types.NUMERIC);
        reg.put("boolean", Types.BIT);
        reg.put("datetime", Types.DATE);
        reg.put("timestamp", Types.DATE);
        reg.put("image", Types.BINARY);
        reg.put("uid", Types.INTEGER);
        reg.put("uname", Types.VARCHAR);
        reg.put("autoGen",Types.VARCHAR);
    }

    public static int getSqlType(String fieldType) {
        return MapUtils.getIntValue(reg, fieldType, Types.VARCHAR);
    }
}

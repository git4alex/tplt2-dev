package org.delta.core.dao;

import org.delta.core.dao.dialect.DBFun;
import org.delta.core.dao.dialect.DBFunction;
import org.delta.core.dao.dialect.Dialect;
import org.delta.core.dao.dialect.SqlServer2005Dialect;
import org.delta.core.utils.ValueMap;
import org.apache.commons.lang.StringUtils;

import java.util.Iterator;

/**
 * date: 2010-11-9
 *
 * version: 1.0
 * commonts: ......
 */
public class UpdateParam extends SqlParam{
	private String tableName;
	private ValueMap columnValue = new ValueMap();
	private Filter filter;

    public UpdateParam(String tableName){
        this.tableName = tableName;
    }

	public String getSql(Dialect dialect){
		StringBuilder sb = new StringBuilder();
		sb.append("UPDATE ").append(tableName).append(" SET ");

        Iterator<String> it = columnValue.keySet().iterator();
        while (it.hasNext()){
            String cn = it.next();
            sb.append(cn).append("=").append(columnValue.get(cn));
            if(it.hasNext()){
                sb.append(",");
            }
        }
		if(filter!=null){
			String filterStr=filter.getSql(dialect);
			if(StringUtils.isNotBlank(filterStr)){
				sb.append(" WHERE ").append(filterStr);
			}
		}

		return sb.toString();
	}

	public ValueMap getSqlParamValues(Dialect dialect){
        ValueMap ret = new ValueMap();
        for(Object item:columnValue.values()){
            if(item instanceof SqlPlaceHolder){
                SqlPlaceHolder sp = (SqlPlaceHolder) item;
                ret.put(sp.getName(),sp.getValue());
            }
        }
        if(filter != null){
            ret.putAll(filter.getSqlParamValues(dialect));
        }
        return ret;
	}

    public void setColumnValue(ValueMap rowValue){
        this.columnValue.clear();
        for(String item:rowValue.keySet()){
            Object v = rowValue.get(item);
            if(v instanceof DBFunction || v instanceof DBFun){
                this.columnValue.put(item,v.toString());
            }else{
                this.columnValue.put(item, new SqlPlaceHolder(item, v));
            }
        }
    }
	public Filter getFilter() {
		return filter;
	}
	public void setFilter(Filter filter) {
		this.filter = filter;
	}
	public String getTableName() {
		return tableName;
	}
	public void setTableName(String tableName) {
		this.tableName = tableName;
	}

    public static void main(String[] args) {
        UpdateParam up = new UpdateParam("tab_test");
        ValueMap row = new ValueMap();
        row.put("id", 100);
        row.put("sex", "M");
        row.put("remark","test");
        row.put("cdate",new DBFunction("sysdate()"));

        up.setColumnValue(row);

        up.setFilter(Filter.field("orgCode").lLike("100-100-").and(Filter.field("f4").in(new String[]{"a","b","c"})));

        System.out.println(up.getSql(new SqlServer2005Dialect()));
        System.out.println(up.getSqlParamValues(new SqlServer2005Dialect()));
    }
}



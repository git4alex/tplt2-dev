package org.delta.core.dao;

import org.delta.core.dao.dialect.DBFun;
import org.delta.core.dao.dialect.DBFunction;
import org.delta.core.dao.dialect.Dialect;
import org.delta.core.dao.dialect.SqlServer2005Dialect;
import org.delta.core.exception.SqlParamException;
import org.delta.core.utils.ValueMap;
import org.apache.commons.collections.MapUtils;
import org.apache.commons.lang.StringUtils;
import org.springframework.util.Assert;

import java.util.ArrayList;
import java.util.List;

/**
 * date: 2010-11-9
 *
 * version: 1.0
 * commonts: ......
 */
public class InsertParam extends SqlParam{
	private String tableName;
    private ValueMap columnValue = new ValueMap();

    public InsertParam(String tableName){
        Assert.hasLength(tableName,"insert时表名不能为空");
        this.tableName = tableName;
    }

	protected String getSql(Dialect dialect){
        if(MapUtils.isEmpty(columnValue)){
            throw new SqlParamException("inset操作未指定列");
        }
		StringBuilder sb = new StringBuilder();
		sb.append("INSERT INTO ").append(tableName);

		List<String> fList=new ArrayList<String>();
		List<Object> vList=new ArrayList<Object>();

        for (String cn:columnValue.keySet()){
            fList.add(cn);
            vList.add(columnValue.get(cn));
        }

		sb.append("(").append(StringUtils.join(fList,",")).append(")");
		sb.append(" VALUES (").append(StringUtils.join(vList, ",")).append(")");

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
        return ret;
	}

	public void setRowValue(ValueMap rowValue){
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

    public static void main(String[] args) {
        InsertParam ip = new InsertParam("tab_test");
        ValueMap row = new ValueMap();
        row.put("id", 100);
        row.put("sex", "M");
        row.put("remark","test");
        row.put("cdate",new DBFunction("sysdate()"));

        ip.setRowValue(row);

        System.out.println(ip.getSql(new SqlServer2005Dialect()));
        System.out.println(ip.getSqlParamValues(new SqlServer2005Dialect()));
    }
}



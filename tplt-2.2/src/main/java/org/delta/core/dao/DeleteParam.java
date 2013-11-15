package org.delta.core.dao;

import org.delta.core.dao.dialect.Dialect;
import org.delta.core.utils.ValueMap;
import org.springframework.util.Assert;
import org.springframework.util.StringUtils;

/**
 * date: 2010-11-9
 *
 * version: 1.0
 * commonts: ......
 */
public class DeleteParam extends SqlParam {
	private String tableName;
	private Filter filter;

    public DeleteParam(String tableName){
        this(tableName,null);
    }

    public DeleteParam(String tableName,Filter filter){
        Assert.isTrue(StringUtils.hasText(tableName),"删除数据时表名不能为空");

        this.tableName = tableName;
        this.setFilter(filter);
    }

	protected String getSql(Dialect dialect){
		StringBuilder sb=new StringBuilder();

		sb.append("DELETE FROM ").append(tableName);
		if(filter!=null){
			String filterStr=filter.getSql(dialect);
			if(StringUtils.hasText(filterStr)){
				sb.append(" WHERE ").append(filterStr);
			}
		}else{
            //TODO:add warning
        }

		return sb.toString();
	}

	protected ValueMap getSqlParamValues(Dialect dialect){
        if(filter != null){
            return filter.getSqlParamValues(dialect);
        }

        return null;
	}

	public void setFilter(Filter filter) {
		this.filter = filter;
	}
}



package org.delta.core.dao;

import org.delta.core.dao.dialect.Dialect;
import org.delta.core.dao.dialect.SqlServer2005Dialect;
import org.delta.core.utils.ValueMap;
import org.apache.commons.collections.CollectionUtils;
import org.apache.commons.lang.StringUtils;
import org.springframework.util.Assert;

import java.util.ArrayList;
import java.util.List;

/**
 * date: 2010-11-9
 * <p/>
 * version: 1.0 commonts: ......
 */
public class QueryParam extends SqlParam {
    private String tableName;
    private Filter filter;
    private OrderBy orderBy;
    private List<String[]> columns = new ArrayList<String[]>();

    public QueryParam(String tableName) {
        Assert.hasLength(tableName,"查询时表名不能为空");
        this.tableName = tableName;
    }

    public String getCountSql(Dialect dialect) {
        return getSql("count(1)", dialect);
    }

    private String getSql(String fieldsStr, Dialect dialect) {
        StringBuilder sb = new StringBuilder();
        sb.append("SELECT ");
        sb.append(fieldsStr);
        sb.append(" FROM ").append(tableName);
        if (filter != null) {
            String str = filter.getSql(dialect);
            if (StringUtils.isNotBlank(str)) {
                sb.append(" WHERE ").append(str);
            }
        }

        if (orderBy != null) {
            sb.append(" ORDER BY ").append(orderBy.toString());
        }

        return sb.toString();
    }

    public void setOrderBy(OrderBy orderBy) {
        this.orderBy = orderBy;
    }

    public OrderBy getOrderBy() {
        return this.orderBy;
    }

    public ValueMap getSqlParamValues(Dialect dialect) {
        if (filter != null) {
            return filter.getSqlParamValues(dialect);
        }
        return null;
    }

    public String getSql(Dialect dialect) {
        return getSql(getFieldsStr(), dialect);
    }

    private String getFieldsStr() {
        if (CollectionUtils.isEmpty(columns)) {
            return "*";
        }
        StringBuffer sb;
        List<String> list = new ArrayList<String>();
        for (String[] field : columns) {
            sb = new StringBuffer();
            sb.append(field[0]);
            if (field.length > 1) {
                sb.append(" as ").append(field[1]);
            }
            list.add(sb.toString());
        }
        return StringUtils.join(list.toArray(), ",");
    }

    public QueryParam addColumn(String colName, String alias) {
        String[] s = new String[]{colName, alias};
        columns.add(s);
        return this;
    }

    public QueryParam addColumn(String fieldName) {
        String[] s = new String[]{fieldName};
        columns.add(s);
        return this;
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

    public static void main(String[] args) {
        QueryParam qp = new QueryParam("test");
        Filter f = Filter.field("f1").eq("1000").and(Filter.field("f2").in(new String[]{"12","23","34"}));
        qp.setFilter(f);
        qp.setOrderBy(new OrderBy().asc("f3").desc("f4"));
        qp.addColumn("top 10 *");

        System.out.println(qp.getSql(new SqlServer2005Dialect()));
        System.out.println(qp.getSqlParamValues(new SqlServer2005Dialect()));
    }
}

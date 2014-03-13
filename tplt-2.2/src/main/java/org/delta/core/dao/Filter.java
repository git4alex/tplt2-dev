package org.delta.core.dao;

import org.delta.core.dao.dialect.Dialect;
import org.delta.core.dao.dialect.SqlServer2005Dialect;
import org.delta.core.utils.ValueMap;
import org.apache.commons.collections.MapUtils;
import org.apache.commons.lang.ObjectUtils;
import org.springframework.util.Assert;
import org.springframework.util.StringUtils;

import java.util.ArrayList;
import java.util.List;

public class Filter extends SqlParam {
    public static final String EQ = "=";
    public static final String GT = ">";
    public static final String LT = "<";
    public static final String GE = ">=";
    public static final String LE = "<=";
    public static final String NOT_EQ1 = "<>";
    public static final String NOT_EQ2 = "!=";
    public static final String LIKE = "LIKE";
    public static final String L_LIKE = "lLIKE";
    public static final String R_LIKE = "rLIKE";
    public static final String IN = "IN";
    public static final String NOT_IN = "NOT IN";
    public static final String IS_NULL = "IS NULL";
    public static final String IS_NOT_NULL = "IS NOT NULL";

    public static final String L_BRACKET = "(";
    public static final String R_BRACKET = ")";

    public static final String AND = "AND";
    public static final String OR = "OR";

    private String extendFilterStr;
    private ValueMap field2ColumnMap;

    private List<SqlToken> tokens = new ArrayList<SqlToken>();

    private Filter() {

    }

    public static SqlToken field(String columnName) {
        Assert.isTrue(StringUtils.hasText(columnName),"查询条件中字段名不能为空");

        Filter filter = new Filter();
        SqlToken ret = new SqlToken(SqlToken.TokenType.field, columnName);
        filter.add(ret);
        ret.filter = filter;
        return ret;
    }

    public static Filter emptyFilter() {
        return new Filter();
    }

    protected void add(SqlToken token) {
        this.tokens.add(token);
    }

    public Filter and(Filter f) {
        if (f != null) {
            this.add(new SqlToken(SqlToken.TokenType.operator, AND));
            this.add(new SqlToken(SqlToken.TokenType.operator, Filter.L_BRACKET));
            this.tokens.addAll(f.tokens);
            this.add(new SqlToken(SqlToken.TokenType.operator, Filter.R_BRACKET));
        }
        return this;
    }

    public Filter or(Filter f) {
        if (f != null) {
            this.add(new SqlToken(SqlToken.TokenType.operator, OR));
            this.add(new SqlToken(SqlToken.TokenType.operator, Filter.L_BRACKET));
            this.tokens.addAll(f.tokens);
            this.add(new SqlToken(SqlToken.TokenType.operator, Filter.R_BRACKET));
        }
        return this;
    }

    public SqlToken and(String field) {
        Assert.isTrue(StringUtils.hasText(field),"查询条件中字段名不能为空");

        this.add(new SqlToken(SqlToken.TokenType.operator, AND));
        SqlToken token = new SqlToken(SqlToken.TokenType.field, field);
        token.filter = this;
        this.add(token);
        return token;
    }

    public SqlToken or(String field) {
        Assert.isTrue(StringUtils.hasText(field),"查询条件中字段名不能为空");

        this.add(new SqlToken(SqlToken.TokenType.operator, OR));
        SqlToken token = new SqlToken(SqlToken.TokenType.field, field);
        token.filter = this;
        this.add(token);
        return token;
    }

    public void setExtendFilterStr(String extendFilterStr) {
        this.extendFilterStr = extendFilterStr;
    }

    protected String getSql(Dialect dialect) {
        StringBuilder sb = new StringBuilder();
        int i = 0;
        for (SqlToken token : this.tokens) {
            if (token.type == SqlToken.TokenType.field) {
                String colName = ObjectUtils.toString(token.value);
                colName = MapUtils.getString(this.field2ColumnMap, colName, colName);
                sb.append(colName).append(" ");
            } else if (token.type == SqlToken.TokenType.value) {
                if (token instanceof SqlToken.InValueToken) {
                    sb.append(L_BRACKET);
                    Object[] vs = (Object[]) token.value;
                    int j = 0;
                    for (Object v : vs) {
                        if (v instanceof SqlPlaceHolder) {
                            SqlPlaceHolder vsp = (SqlPlaceHolder) v;
                            sb.append(v).append("_").append(i).append("_").append(j);

                            if (j < vs.length - 1) {
                                sb.append(",");
                            }
                        }
                        j++;
                    }
                    sb.append(R_BRACKET).append(" ");
                } else if (token.value instanceof SqlPlaceHolder) {
                    sb.append(token.value.toString()).append("_").append(i).append(" ");
                }
            } else {
                sb.append(token).append(" ");
            }

            i++;
        }

        return sb.toString();
    }

    public ValueMap getField2ColumnMap() {
        return field2ColumnMap;
    }

    public void setField2ColumnMap(ValueMap field2ColumnMap) {
        this.field2ColumnMap = field2ColumnMap;
    }

    protected ValueMap getSqlParamValues(Dialect dialect) {
        ValueMap ret = new ValueMap();

        int i = 0;
        for (SqlToken token : this.tokens) {
            if (token instanceof SqlToken.InValueToken) {
                Object[] vs = (Object[]) token.value;
                int j = 0;
                for (Object v : vs) {
                    if (v instanceof SqlPlaceHolder) {
                        SqlPlaceHolder vsp = (SqlPlaceHolder) v;
                        ret.put(vsp.getName() + "_" + i + "_" + j, vsp.getValue());
                    }
                    j++;
                }
            } else if (token.value instanceof SqlPlaceHolder) {
                SqlPlaceHolder sp = (SqlPlaceHolder) token.value;
                ret.put(sp.getName() + "_" + i, sp.getValue());
            }
            i++;
        }
        return ret;
    }

    public static void main(String[] args) {
        Filter filter = Filter.field("name").in("1").and("f").lt(3).and("f").lLike("aaa");
        Filter f = Filter.field("a").eq("1");
        System.out.println(filter.getSql(new SqlServer2005Dialect()));
        System.out.println(filter.getSqlParamValues(new SqlServer2005Dialect()));
    }
}

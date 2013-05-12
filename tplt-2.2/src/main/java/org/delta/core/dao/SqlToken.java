package org.delta.core.dao;

import org.delta.core.dao.dialect.DBFunction;
import org.delta.core.exception.DataAccessException;
import org.apache.commons.lang.ObjectUtils;
import org.apache.commons.lang.StringUtils;

import java.util.ArrayList;
import java.util.Collection;
import java.util.List;

/**
 * User: Alex
 * Date: 13-1-22
 * Time: 下午12:03
 */
public class SqlToken {
    protected TokenType type;
    protected Object value;
    protected Filter filter;

    enum TokenType {
        field,
        operator,
        value
    }

    protected SqlToken() {

    }

    public SqlToken(Filter f) {
        this.filter = f;
    }

    protected SqlToken(TokenType type, Object value) {
        this.type = type;
        this.value = value;
    }

    private Filter op(String operator, Object value) {
        if (value == null) {
            throw new DataAccessException("Filter的相等操作不能接受null值");
        }
        this.filter.add(new SqlToken(TokenType.operator, operator));
        if (value instanceof DBFunction) {

        } else {
            value = new SqlPlaceHolder(ObjectUtils.toString(this.value), value);
        }

        this.filter.add(new SqlToken(TokenType.value, value));
        return this.filter;
    }

    private Filter op(String operator) {
        this.filter.add(new SqlToken(TokenType.operator, operator));
        return this.filter;
    }

    public Filter eq(Object value) {
        return op(Filter.EQ, value);
    }

    public Filter lt(Object value) {
        return op(Filter.LT, value);
    }

    public Filter gt(Object value) {
        return op(Filter.GT, value);
    }

    public Filter le(Object value) {
        return op(Filter.LE, value);
    }

    public Filter ge(Object value) {
        return op(Filter.GE, value);
    }

    public Filter ne(Object value) {
        return op(Filter.NOT_EQ1, value);
    }

    public Filter like(Object value) {
        return op(Filter.LIKE, "%"+value+"%");
    }

    public Filter lLike(Object value) {
        return op(Filter.LIKE, value+"%");
    }

    public Filter rLike(Object value) {
        return op(Filter.LIKE, "%"+value);
    }

    protected class InValueToken extends SqlToken {
        public InValueToken(Object[] values) {
            this.type = TokenType.value;
            this.value = values;
        }

        public String toString() {
            return Filter.L_BRACKET + StringUtils.join((Object[]) this.value, ",") + Filter.R_BRACKET;
        }
    }

    public Filter in(Object obj) {
        Object[] value;
        if (obj instanceof Collection) {
            Collection c = (Collection) obj;
            value = c.toArray();
        } else if (obj.getClass().isArray()) {
            value = (Object[]) obj;
        } else {
            value = new Object[]{obj};
        }

        List<Object> vs = new ArrayList<Object>();
        for (Object v : value) {
            if (v instanceof DBFunction) {
                vs.add(v);
            } else {
                vs.add(new SqlPlaceHolder(ObjectUtils.toString(this.value), v));
            }
        }

        this.filter.add(new SqlToken(TokenType.operator, Filter.IN));
        this.filter.add(new InValueToken(vs.toArray()));

        return this.filter;
    }

    public Filter notIn(Object obj) {
        Object[] values;
        if (obj instanceof Collection) {
            Collection c = (Collection) obj;
            values = c.toArray();
        } else if (obj.getClass().isArray()) {
            values = (Object[]) obj;
        } else {
            values = new Object[]{obj};
        }

        List<Object> vs = new ArrayList<Object>();
        for (Object v : values) {
            if (v instanceof DBFunction) {
                vs.add(v);
            } else {
                vs.add(new SqlPlaceHolder(ObjectUtils.toString(this.value), v));
            }
        }

        this.filter.add(new SqlToken(TokenType.operator, Filter.NOT_IN));
        this.filter.add(new InValueToken(vs.toArray()));

        return this.filter;
    }

    public Filter isNull() {
        return this.op(Filter.IS_NULL);
    }

    public Filter isNotNull() {
        return this.op(Filter.IS_NOT_NULL);
    }

    public String toString() {
        return ObjectUtils.toString(this.value);
    }
}

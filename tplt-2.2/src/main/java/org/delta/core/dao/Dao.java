package org.delta.core.dao;

import org.apache.commons.collections.MapUtils;
import org.delta.core.dao.dialect.Dialect;
import org.delta.core.exception.DataAccessException;
import org.delta.core.utils.DbSchemaUtil;
import org.delta.core.utils.ValueMap;
import org.delta.core.utils.ValueMapUtil;
import org.springframework.dao.DataRetrievalFailureException;
import org.springframework.jdbc.core.PreparedStatementCreator;
import org.springframework.jdbc.core.namedparam.NamedParameterUtils;
import org.springframework.jdbc.core.namedparam.ParsedSql;
import org.springframework.jdbc.core.namedparam.SqlParameterSource;
import org.springframework.jdbc.core.simple.SimpleJdbcDaoSupport;
import org.springframework.jdbc.support.GeneratedKeyHolder;
import org.springframework.jdbc.support.KeyHolder;
import org.springframework.stereotype.Repository;

import javax.annotation.PostConstruct;
import javax.annotation.Resource;
import javax.sql.DataSource;
import java.io.File;
import java.io.FileInputStream;
import java.io.FileNotFoundException;
import java.io.InputStream;
import java.sql.*;
import java.util.List;

@Repository("dao")
public class Dao extends SimpleJdbcDaoSupport {
    private Dialect dialect;

    @PostConstruct
    private void checkDbSchema(){
        logger.info("check database schema.");
        DbSchemaUtil.checkDatabaseSchema(this.getDataSource());
    }

    @Resource
    public void setDs(DataSource ds) {
        super.setDataSource(ds);
    }

    public ValueMap get(QueryParam param){
        List<ValueMap> list = list(param);

        if (list == null || list.size() < 1) {
            return null;
        } else if (list.size() == 1) {
            return list.get(0);
        } else {
            throw new DataAccessException("需要一行记录，实际返回：" + list.size()+"行");
        }
    }

    public List<ValueMap> list(QueryParam param){
        String sql = param.getSql(dialect);
        ValueMap paramValues = param.getSqlParamValues(dialect);

        if (logger.isDebugEnabled()) {
            logger.debug("org.delta.system.service.sql:" + sql);
            if(MapUtils.isNotEmpty(paramValues)){
                logger.debug("params:" + paramValues);
            }
        }
        return ValueMapUtil.convertList(this.getSimpleJdbcTemplate().queryForList(sql, paramValues));
    }

    public Page page(QueryParam param,int start, int limit){
        String sql = param.getSql(dialect);
        int totalCount = count(param);
        String limitSql = dialect.getLimitString(sql, start, limit);
        ValueMap paramValues = param.getSqlParamValues(dialect);

        if (logger.isDebugEnabled()) {
            logger.debug("org.delta.system.service.sql:" + limitSql);
            if(MapUtils.isNotEmpty(paramValues)){
                logger.debug("params:" + paramValues);
            }
        }

        List items = this.getSimpleJdbcTemplate().queryForList(limitSql, paramValues);
        return new Page(items,start,limit,totalCount);
    }

    public int count(QueryParam param){
        String sql = param.getCountSql(dialect);
        ValueMap paramValues = param.getSqlParamValues(dialect);
        if (logger.isDebugEnabled()) {
            logger.debug("org.delta.system.service.sql:" + sql);
            if(MapUtils.isNotEmpty(paramValues)){
                logger.debug("params:" + paramValues);
            }
        }

        return this.getSimpleJdbcTemplate().queryForInt(sql, paramValues);
    }

    public Number insert(InsertParam param){
        final String sql=param.getSql(dialect);
        ValueMap paramValues = param.getSqlParamValues(dialect);

        SqlParameterSource paramSource = new MapSqlParameterSource(paramValues);
        final String parsedSql = NamedParameterUtils.parseSqlStatementIntoString(sql);
        ParsedSql psSql = NamedParameterUtils.parseSqlStatement(sql);
        final Object[] vs = NamedParameterUtils.buildValueArray(psSql, paramSource, null);

        if (logger.isDebugEnabled()) {
            logger.debug("org.delta.system.service.sql:" + parsedSql);
            if(MapUtils.isNotEmpty(paramValues)){
                logger.debug("params:" + paramValues);
            }
        }

        KeyHolder keyHolder = new GeneratedKeyHolder();
        this.getJdbcTemplate().update(new PreparedStatementCreator() {
            public PreparedStatement createPreparedStatement(Connection connection) throws SQLException {
                PreparedStatement ps = connection.prepareStatement(parsedSql, Statement.RETURN_GENERATED_KEYS);
                for (int i = 0; i < vs.length; i++) {
                    Object obj = vs[i];
                    if (obj instanceof File) {
                        try {
                            File file = (File) obj;
                            InputStream stream;
                            stream = new FileInputStream(file);
                            ps.setBinaryStream(i + 1, stream, (int) file.length());
                        } catch (FileNotFoundException e) {
                            e.printStackTrace();
                            logger.error(e.getMessage(), e);
                            throw new RuntimeException(e.getMessage());
                        }
                    } else {
                        ps.setObject(i + 1, vs[i]);
                    }
                }
                return ps;
            }
        },keyHolder);

        try {
            return keyHolder.getKey();
        } catch (DataRetrievalFailureException e) {
            return null;
        }
    }

    public int update(UpdateParam param){
        String sql=param.getSql(dialect);
        ValueMap paramValues = param.getSqlParamValues(dialect);
        if (logger.isDebugEnabled()) {
            logger.debug("org.delta.system.service.sql:" + sql);
            if(MapUtils.isNotEmpty(paramValues)){
                logger.debug("params:" + paramValues);
            }
        }
        return this.getSimpleJdbcTemplate().update(sql, paramValues);
    }

    public int delete(DeleteParam param){
        String sql = param.getSql(dialect);

        ValueMap paramValues = param.getSqlParamValues(dialect);
        if (logger.isDebugEnabled()) {
            logger.debug("org.delta.system.service.sql:" + sql);
            if(MapUtils.isNotEmpty(paramValues)){
                logger.debug("params:" + paramValues);
            }
        }

        return this.getSimpleJdbcTemplate().update(sql, paramValues);
    }
}

class MapSqlParameterSource implements SqlParameterSource {
	private ValueMap value = new ValueMap();
	public MapSqlParameterSource(ValueMap value) {
		this.value = value;
	}

	public boolean hasValue(String paramName) {
		return value.containsKey(paramName);
	}

	public Object getValue(String paramName) throws IllegalArgumentException {
		return value.get(paramName);
	}

	public String getTypeName(String paramName) {
		return null;
	}

	public int getSqlType(String paramName) {
		return Types.OTHER;
	}
}

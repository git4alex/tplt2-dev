package org.delta.core.dao;

import org.delta.core.dao.dialect.Dialect;
import org.delta.core.utils.ValueMap;

public abstract class SqlParam {
    /**
     * 获取Sql操作的sql语句
     *
     * @param dialect 方言
     */
	protected abstract String getSql(Dialect dialect);

    /**
     * 获取Sql操作的参数值列表
     *
     * @param dialect 方言
     */
	protected abstract ValueMap getSqlParamValues(Dialect dialect);
}

package org.delta.core.sql.service;

import org.delta.core.dao.Dao;
import org.delta.core.dao.Page;
import org.delta.core.dao.dialect.Dialect;
import org.delta.core.entity.service.AclService;
import org.delta.core.exception.BusinessException;
import org.delta.core.sql.provider.XmlSqlProvider;
import org.delta.core.sql.provider.templete.StringTemplateLoader;
import org.delta.core.utils.ValueMap;
import org.delta.core.utils.ValueMapUtil;
import freemarker.template.Configuration;
import freemarker.template.Template;
import freemarker.template.TemplateException;
import org.apache.commons.lang.StringUtils;
import org.apache.log4j.Logger;
import org.springframework.stereotype.Service;

import javax.annotation.Resource;
import java.io.IOException;
import java.io.StringWriter;
import java.util.List;

/**
 * date: 2011-7-27
 * <p/>
 * version: 1.0
 * commonts: ......
 */
@Service
public class SimpleSqlService {
    private Logger logger = Logger.getLogger(this.getClass());

    @Resource
    private Dao dao;

    @Resource
    private XmlSqlProvider provider;
    @Resource
    private AclService aclService;
    @Resource
    private Dialect dialect;

    public List<ValueMap> list(String namespace, String sqlName, ValueMap data) throws BusinessException {
        String key = provider.getSqlKey(namespace, sqlName);
        String accessFilter = aclService.getAccessFilter(key);
        if (StringUtils.isNotBlank(accessFilter)) {
            data.put("aclFilter", accessFilter);
        }
        String sql = getSql(key, data);
        if (logger.isDebugEnabled()) {
            logger.debug(sql);
        }
        return ValueMapUtil.convertList(dao.getJdbcTemplate().queryForList(sql));
    }

    public Page page(String namespace, String sqlName, ValueMap data, int start, int limit) throws BusinessException {
        String key = provider.getSqlKey(namespace, sqlName);
            String accessFilter = aclService.getAccessFilter(key);
            if (StringUtils.isNotBlank(accessFilter)) {
                data.put("accessFilter", accessFilter);
            }
        String sql = getSql(key, data);

        String countSql = dialect.getCountSqlString(sql);
        String limitSql = dialect.getLimitString(sql, start, limit);
        if (logger.isDebugEnabled()) {
            logger.debug(sql);
            logger.debug(countSql);
            logger.debug(limitSql);
        }

        int totalCount = dao.getJdbcTemplate().queryForInt(countSql);
        List items = dao.getJdbcTemplate().queryForList(limitSql);

        return new Page(items,start, limit,totalCount);
    }

    private String getSql(String key, ValueMap data) throws BusinessException {
        logger.debug("sql key is " + key);
        String markupSql = provider.getSql(key);

        Configuration cfg = new Configuration();
        cfg.setTemplateLoader(new StringTemplateLoader(markupSql));
        cfg.setDefaultEncoding("UTF-8");
        StringWriter writer = new StringWriter();
        try {
            Template template = cfg.getTemplate("");
            template.process(data, writer);
        } catch (IOException e) {
            e.printStackTrace();
            logger.error(e.getMessage(), e);
            throw new BusinessException(e.getMessage());
        } catch (TemplateException e) {
            e.printStackTrace();
            logger.error(e.getMessage(), e);
            throw new BusinessException(e.getMessage());
        }

        return writer.toString();
    }
}



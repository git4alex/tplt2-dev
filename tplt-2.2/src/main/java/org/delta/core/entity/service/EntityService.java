package org.delta.core.entity.service;

import org.delta.core.dao.*;
import org.delta.core.dao.dialect.DBFunction;
import org.delta.core.entity.EntityEventManager;
import org.delta.core.entity.EntityEventManager.EntityEvent;
import org.delta.core.entity.EntityMap;
import org.delta.core.entity.code.TpltEnumEntityCode;
import org.delta.core.exception.BusinessException;
import org.delta.core.metadata.EntityMetadata;
import org.delta.core.metadata.FieldMetadata;
import org.delta.core.metadata.MetadataConst.DataType;
import org.delta.core.metadata.service.AutoGenService;
import org.delta.core.metadata.service.MetadataProvider;
import org.delta.core.utils.UploadFileUtils.UploadFileFolder;
import org.delta.core.utils.ValueMap;
import org.delta.spring.holder.AppContextHolder;
import org.apache.commons.collections.MapUtils;
import org.apache.commons.lang.ObjectUtils;
import org.apache.commons.lang.StringUtils;
import org.apache.log4j.Logger;
import org.springframework.dao.DuplicateKeyException;
import org.springframework.stereotype.Service;
import org.springframework.util.Assert;

import javax.annotation.Resource;
import java.io.File;
import java.io.Serializable;
import java.net.URISyntaxException;
import java.net.URL;
import java.sql.Timestamp;
import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.util.*;

/**
 * date: 2010-7-20
 * <p/>
 * version: 1.0 commonts: ......
 */
@Service
public class EntityService {//TODO:增加数据库方言支持
    private static Logger logger = Logger.getLogger(EntityService.class);
    public static final String FIELD_CODE_KEY = "field";
    public static final String OPERATOR_KEY = "operator";
    public static final String VALUE_KEY = "value";

    @Resource
    protected MetadataProvider metadataProvider;
    @Resource
    protected AclService aclService;
    @Resource
    protected Dao dao;
    @Resource
    protected EntityEventManager eventManager;
    @Resource
    protected AutoGenService autoGenService;

    public void setDao(Dao dao) {
        this.dao = dao;
    }

    public ValueMap getById(String entityCode, Serializable id) {
        Assert.notNull(entityCode, "[entityCode] 不能为空");
        Assert.notNull(id, "[id] 不能为空");

        EntityMetadata metadata = metadataProvider.getEntityMetadata(entityCode);
        Filter filter = Filter.field(metadata.getPkCode()).eq(id);
        return get(entityCode, filter);
    }

    public ValueMap get(String entityCode, Filter filter) {
        Assert.notNull(entityCode, "[entityCode] 不能为空");

        EntityMetadata metadata = metadataProvider.getEntityMetadata(entityCode);
        String aclFilter = aclService.getAccessFilter(entityCode);
        filter.setExtendFilterStr(aclFilter);
        filter.and(getDeletedFilter(metadata));
        filter.setField2ColumnMap(metadata.getFieldColumnMap());

        QueryParam qp = new QueryParam(metadata.getTableName());
        qp.setFilter(filter);
        for (FieldMetadata fieldMetadata : metadata.getFieldList()) {
            String fieldCode = fieldMetadata.getCode();
            String delCode = metadata.getDelCode();
            if (!StringUtils.equalsIgnoreCase(fieldCode, delCode)) {
                qp.addColumn(fieldMetadata.getColumnName(), fieldMetadata.getCode());
            }
        }
        return dao.get(qp);
    }

    public EntityMap lock(String entityCode, Serializable id) {
        throw new UnsupportedOperationException("暂时不支持此操作");
    }

    public ValueMap save(String entityCode, ValueMap value) {
        Assert.isTrue(StringUtils.isNotBlank(entityCode), "保存实体时实体编码不能为空");

        EntityMetadata metadata = metadataProvider.getEntityMetadata(entityCode);
        String pkVal = MapUtils.getString(value, metadata.getPkCode());

        ValueMap entity;
        if (StringUtils.isBlank(pkVal)) {
            entity = create(entityCode, value);
        } else {
            entity = updateById(entityCode, pkVal, value);
        }
        return entity;
    }

    public List<ValueMap> create(String entityCode,List<HashMap> vs){
        List<ValueMap> rs = new ArrayList<ValueMap>();

        for(HashMap v:vs){
            ValueMap vm = new ValueMap();
            vm.putAll(v);
            rs.add(create(entityCode, vm));
        }
        return rs;
    }

    public ValueMap create(String entityCode, ValueMap entityMap) {
        Assert.isTrue(StringUtils.isNotBlank(entityCode), "创建实体时实体编码不能为空");
        EntityMetadata metadata = metadataProvider.getEntityMetadata(entityCode);
        eventManager.fire(metadata.getCode(), EntityEvent.PRE_CREATE, entityMap);
        List<FieldMetadata> fieldList = metadata.getFieldList();
        for (FieldMetadata fm : fieldList) {
            if (DataType.DATATYPE_IMAGE == fm.getFieldDataType()) {
                String id = MapUtils.getString(entityMap, fm.getCode());
                if (StringUtils.isNotBlank(id)) {
                    createImage(id);
                }
            }
        }
        InsertParam ip = new InsertParam(metadata.getTableName());
        ValueMap map = getDbColumnMapForUpdate(metadata, entityMap);
        //map.remove(metadata.getPkCode());
        ip.setRowValue(map);
        String id = ObjectUtils.toString(dao.insert(ip));
        ValueMap entity = getById(entityCode, id);
        eventManager.fire(entityCode, EntityEvent.POST_CREATE, entity);
        return entity;
    }

    public ValueMap updateById(String entityCode, String id, ValueMap value) {
        Assert.isTrue(StringUtils.isNotBlank(entityCode), "更新实体时实体编码不能为空");

        EntityMetadata metadata = metadataProvider.getEntityMetadata(entityCode);
        String pkCode = metadata.getPkCode();
        if (StringUtils.isBlank(pkCode)) {
            throw new BusinessException("更新实体时，实体未定义主键");
        }

        if (StringUtils.isBlank(id)) {
            throw new BusinessException("更新实体时，未指定主键值");
        }

        int count = update(entityCode, value, Filter.field(pkCode).eq(id));

        if (count != 1) {
            throw new BusinessException("更新行数错误，应为1行，实际为" + count + "行");
        }

        return getById(entityCode, id);
    }

    public int update(String entityCode, ValueMap value, Filter filter) throws BusinessException {
        Assert.isTrue(StringUtils.isNotBlank(entityCode), "更新实体时未指定实体类型");

        EntityMetadata metadata = metadataProvider.getEntityMetadata(entityCode);

        eventManager.fire(metadata.getCode(), EntityEvent.PRE_UPDATE, value);
        List<FieldMetadata> fieldList = metadata.getFieldList();
        for (FieldMetadata fieldMetadata : fieldList) {
            if (DataType.DATATYPE_IMAGE == fieldMetadata.getFieldDataType()) {
                String imgId = MapUtils.getString(value, fieldMetadata.getCode());
                createImage(imgId);
            }
        }

        String pkCode = metadata.getPkCode();
        value.remove(pkCode);
        String delCode = metadata.getDelCode();
        value.remove(delCode);

        ValueMap map = getDbColumnMapForUpdate(metadata, value);
        UpdateParam up = new UpdateParam(metadata.getTableName());

        filter.and(getDeletedFilter(metadata));
        up.setFilter(filter); //TODO:修改实体时需要增加访问控制
        filter.setField2ColumnMap(metadata.getFieldColumnMap());
        up.setColumnValue(map);
        int ret = dao.update(up);

        eventManager.fire(entityCode, EntityEvent.POST_UPDATE, filter);
        return ret;
    }

    public int deleteById(String entityCode, String id) {
        Assert.isTrue(StringUtils.isNotBlank(entityCode), "删除实体时未指定实体类型");

        EntityMetadata metadata = metadataProvider.getEntityMetadata(entityCode);

        String pkCode = metadata.getPkCode();
        if (StringUtils.isBlank(pkCode)) {
            throw new BusinessException("删除实体时，实体未定义主键");
        }

        if (StringUtils.isBlank(id)) {
            throw new BusinessException("删除实体时，未指定主键值");
        }

        return delete(entityCode, Filter.field(pkCode).eq(id));
    }

    public int delete(String entityCode, Filter filter) {
        Assert.isTrue(StringUtils.isNotBlank(entityCode), "删除实体时未指定实体类型");

        EntityMetadata metadata = metadataProvider.getEntityMetadata(entityCode);

        eventManager.fire(metadata.getCode(), EntityEvent.PRE_DELETE, filter);

        String aclFilter = aclService.getAccessFilter(entityCode);
        if (filter == null) {
            filter = Filter.emptyFilter();
        }
        filter.setExtendFilterStr(aclFilter);
        filter.setField2ColumnMap(metadata.getFieldColumnMap());

        int ret;
        String delCode = metadata.getDelCode();
        if (StringUtils.isNotBlank(delCode)) { //标记删除
            UpdateParam up = new UpdateParam(metadata.getTableName());
            up.setFilter(filter);
            ValueMap vm = new ValueMap();
            vm.put(delCode, new DBFunction("SYSDATETIME()"));
            up.setColumnValue(vm);
            ret = dao.update(up);
        } else {
            DeleteParam dp = new DeleteParam(metadata.getTableName());
            dp.setFilter(filter);
            ret = dao.delete(dp);
        }
        eventManager.fire(metadata.getCode(), EntityEvent.POST_DELETE, filter);
        return ret;
    }

    public void createImage(String id) throws BusinessException {
        EntityMetadata metadata = metadataProvider.getEntityMetadata(TpltEnumEntityCode.UPLOAD.toString());

        StringBuffer fullPath;
        try {
            URL url = this.getClass().getClassLoader().getResource("");
            if (url == null) {
                return;
            }
            File file = new File(url.toURI().getPath());
            file = file.getParentFile().getParentFile();
            fullPath = new StringBuffer(file.getPath());
            fullPath.append("/").append(UploadFileFolder.UPLOAD_FOLDER).append("/");
            String[] folder = id.split("-");
            for (int i = 0; i < folder.length - 1; i++) {
                fullPath.append(folder[i]).append("/");
            }
            fullPath.append(id.replaceAll("[|]", "."));
            file = new File(fullPath.toString());
            ValueMap parameter = new ValueMap();
            parameter.put(metadata.getPkCode(), id);
            parameter.put("content", file);
            parameter.put("cdate", null);
            ValueMap map = getDbColumnMapForUpdate(metadata, parameter);
            InsertParam ip = new InsertParam(metadata.getTableName());
            ip.setRowValue(map);
            dao.insert(ip);
        } catch (URISyntaxException e) {
            logger.error(e.getMessage(), e);
            throw new BusinessException("保存文件时路径错误");
        } catch (DuplicateKeyException e) {
            logger.error(e.getMessage(), e);
            throw new BusinessException("保存文件时违反主键约束");
        }
    }

    public List<ValueMap> list(String entityCode, Filter filter) throws BusinessException {
        EntityMetadata metadata = metadataProvider.getEntityMetadata(entityCode);
        return list(entityCode, filter, new OrderBy().desc(metadata.getPkCode()));
    }

    public List<ValueMap> list(String entityCode, Filter filter, OrderBy orderBy) throws BusinessException {
        EntityMetadata metadata = metadataProvider.getEntityMetadata(entityCode);
        if (filter == null) {
            filter = getDeletedFilter(metadata);
        }

        if(filter == null){
            filter = Filter.emptyFilter();
        }

        String aclFilter = aclService.getAccessFilter(entityCode);
        if(StringUtils.isNotBlank(aclFilter)){
            filter.setExtendFilterStr(aclFilter);
        }

        filter.setField2ColumnMap(metadata.getFieldColumnMap());

        QueryParam qp = new QueryParam(metadata.getTableName());
        for (FieldMetadata fm : metadata.getFieldList()) {
            qp.addColumn(fm.getColumnName(), fm.getCode());
        }
        qp.setFilter(filter);
        qp.setOrderBy(orderBy);

        return dao.list(qp);
    }

    public Page page(String entityCode, Filter filter, OrderBy orderBy, final int start, final int limit) throws BusinessException {
        EntityMetadata metadata = metadataProvider.getEntityMetadata(entityCode);

        String aclFilter = aclService.getAccessFilter(entityCode);
        if (filter == null) {
            filter = Filter.emptyFilter();
        }
        filter.setExtendFilterStr(aclFilter);
        filter.and(getDeletedFilter(metadata));
        filter.setField2ColumnMap(metadata.getFieldColumnMap());

        QueryParam qp = new QueryParam(metadata.getTableName());
        for (FieldMetadata fm : metadata.getFieldList()) {
            qp.addColumn(fm.getColumnName(), fm.getCode());
        }
        qp.setFilter(filter);
        qp.setOrderBy(orderBy);

        return dao.page(qp, start, limit);
    }

    public int count(String entityCode, Filter filter) {
        EntityMetadata metadata = metadataProvider.getEntityMetadata(entityCode);

        String aclFilter = aclService.getAccessFilter(entityCode);
        if (filter == null) {
            filter = Filter.emptyFilter();
        }
        filter.setExtendFilterStr(aclFilter);
        filter.and(getDeletedFilter(metadata));
        filter.setField2ColumnMap(metadata.getFieldColumnMap());

        QueryParam qp = new QueryParam(metadata.getTableName());
        for (FieldMetadata fm : metadata.getFieldList()) {
            qp.addColumn(fm.getColumnName(), fm.getCode());
        }
        qp.setFilter(filter);

        return dao.count(qp);
    }

    public Filter createFilter(String entityCode, List filterMapList) throws BusinessException {
        if (filterMapList == null) {
            return null;
        }
        Filter filter = null;

        // 去掉重复项
        ValueMap tempWhere = new ValueMap();
        for (Object fm : filterMapList) {
            tempWhere.put(ObjectUtils.toString(fm), fm);
        }

        EntityMetadata metadata = metadataProvider.getEntityMetadata(entityCode);
        for (Object item : tempWhere.values()) {
            if (item instanceof Map) {
                Map filterMap = (Map) item;
                String field = MapUtils.getString(filterMap, FIELD_CODE_KEY);
                String operate = MapUtils.getString(filterMap, OPERATOR_KEY);
                Object value = MapUtils.getObject(filterMap, VALUE_KEY);

                if (StringUtils.isBlank(field) || StringUtils.isBlank(operate) || field.equalsIgnoreCase("_dc")) {
                    continue;
                }

                if (value != null && value.getClass().isEnum()) {
                    value = value.toString();
                }

                if (value != null && value.getClass().isArray()) {
                    Object[] vs = (Object[]) value;
                    List<String> v1 = new ArrayList<String>();
                    for (Object v : vs) {
                        v1.add(v.toString());
                    }
                    value = v1.toArray(new String[v1.size()]);
                }

                operate = operate.trim();
                Filter ft = null;
                if (Filter.EQ.equalsIgnoreCase(operate)) {
                    ft = Filter.field(field).eq(value);
                } else if (Filter.GT.equalsIgnoreCase(operate)) {
                    ft = Filter.field(field).gt(value);
                } else if (Filter.LT.equalsIgnoreCase(operate)) {
                    ft = Filter.field(field).lt(value);
                } else if (Filter.GE.equalsIgnoreCase(operate)) {
                    ft = Filter.field(field).ge(value);
                } else if (Filter.LE.equalsIgnoreCase(operate)) {
                    ft = Filter.field(field).le(value);
                } else if (Filter.NOT_EQ1.equalsIgnoreCase(operate) || Filter.NOT_EQ2.equalsIgnoreCase(operate)) {
                    ft = Filter.field(field).ne(value);
                } else if (Filter.LIKE.equalsIgnoreCase(operate)) {
                    ft = Filter.field(field).like(value);
                } else if (Filter.L_LIKE.equalsIgnoreCase(operate)) {
                    ft = Filter.field(field).lLike(value);
                } else if (Filter.R_LIKE.equalsIgnoreCase(operate)) {
                    ft = Filter.field(field).rLike(value);
                } else if (Filter.IN.equalsIgnoreCase(operate)) {
                    ft = Filter.field(field).in(value);
                } else if (Filter.NOT_IN.equalsIgnoreCase(operate)) {
                    ft = Filter.field(field).notIn(value);
                } else if (Filter.IS_NULL.equalsIgnoreCase(operate)) {
                    ft = Filter.field(field).isNull();
                } else if (Filter.IS_NOT_NULL.equalsIgnoreCase(operate)) {
                    ft = Filter.field(field).isNotNull();
                }

                if (ft != null) {
                    if (filter == null) {
                        filter = ft;
                    } else {
                        filter.and(ft);
                    }
                }
            }
        }
        if (filter != null) {
            filter.setField2ColumnMap(metadata.getFieldColumnMap());
        }
        return filter;
    }

    protected ValueMap getDbColumnMapForUpdate(EntityMetadata em, ValueMap fieldValues) {
        ValueMap map = new ValueMap();
        for (String fieldCode : fieldValues.keySet()) {
            Object fieldValue = fieldValues.get(fieldCode);
            FieldMetadata fm = em.getFieldMetadataByFieldCode(fieldCode);
            if (fm != null) {
                String v = ObjectUtils.toString(fieldValue);
                if (StringUtils.isBlank(v)) {
                    fieldValue = null;
                }
                map.put(fm.getColumnName(), getRealValue(fm, fieldValue));
            }
        }
        return map;
    }

    private Object getRealValue(FieldMetadata fm, Object v) {
        if (fm == null) {
            return v;
        }

        if (StringUtils.isBlank((ObjectUtils.toString(v)))) {
            return null;
        }

        DataType tp = fm.getFieldDataType();
        if (DataType.DATATYPE_TIMESTAMP == tp) {
            return new Timestamp(new Date().getTime());
        } else if (DataType.DATATYPE_DATETIME == tp) {
            try {
                Date dt = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss").parse(ObjectUtils.toString(v));
                return new java.sql.Date(dt.getTime());
            } catch (ParseException e) {
                e.printStackTrace();
                throw new RuntimeException("读取日期类型的数据出错：" + v);
            }
        } else if (DataType.DATATYPE_UID == tp) {
            return AppContextHolder.getLoginUser().getId();
        } else if (DataType.DATATYPE_UNAME == tp) {
            return AppContextHolder.getLoginUser().getName();
        } else if (DataType.DATATYPE_ORG_ID == tp) {
            return AppContextHolder.getLoginUser().getOrgId();
        } else if (DataType.DATATYPE_ORG_NAME == tp) {
            return AppContextHolder.getLoginUser().getOrgName();
        } else if (DataType.DATATYPE_AUTO_GEN == tp) {
            String c = fm.getBizTypeCode();
            return autoGenService.createNewValue(c);
        } else if (v != null && v.getClass().isEnum()) {
            return v.toString();
        } else {
            return v;
        }
    }

    private Filter getDeletedFilter(EntityMetadata metadata) {
        String delCode = metadata.getDelCode();
        if (StringUtils.isNotBlank(delCode)) {
            return Filter.field(delCode).isNull();
        }
        return null;
    }
}

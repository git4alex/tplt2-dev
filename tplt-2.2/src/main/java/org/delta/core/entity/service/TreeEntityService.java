package org.delta.core.entity.service;

import org.delta.core.dao.Filter;
import org.delta.core.dao.InsertParam;
import org.delta.core.dao.OrderBy;
import org.delta.core.dao.QueryParam;
import org.delta.core.dao.dialect.DBFunction;
import org.delta.core.entity.EntityEventManager.EntityEvent;
import org.delta.core.entity.TreeConfig;
import org.delta.core.exception.BusinessException;
import org.delta.core.metadata.EntityMetadata;
import org.delta.core.utils.TreeBuilder;
import org.delta.core.utils.ValueMap;
import org.apache.commons.collections.MapUtils;
import org.apache.commons.lang.ObjectUtils;
import org.apache.commons.lang.StringUtils;
import org.apache.log4j.Logger;
import org.springframework.stereotype.Service;
import org.springframework.util.Assert;

import java.util.ArrayList;
import java.util.List;

/**
 * project: metadataApp date: 2010-7-5 author: wangliang
 * <p/>
 * version: 1.0 commonts: ......
 */
@Service
public class TreeEntityService extends EntityService {
    private static Logger logger = Logger.getLogger(TreeEntityService.class);

    public ValueMap createNode(String entityCode, TreeConfig config, ValueMap node) throws BusinessException {
        Assert.isTrue(StringUtils.isNotBlank(entityCode), "createNode时，实体编码不能为空");
        Assert.notNull(config, "createNode时，树形结构不能为空");

        eventManager.fire(entityCode, EntityEvent.PRE_CREATE, node);
        EntityMetadata metadata = metadataProvider.getEntityMetadata(entityCode);
        String pidCode = config.getPidCode();
        String indexCode = config.getIndexCode();

        String pid = MapUtils.getString(node, pidCode);
        Integer index = null;
        if (StringUtils.isNotBlank(indexCode)) {
            index = MapUtils.getInteger(node, indexCode);
            node.remove(indexCode);
        }
        node.remove(pidCode);

        InsertParam ip = new InsertParam(metadata.getTableName());
        ValueMap map = getDbColumnMapForUpdate(metadata, node);
        ip.setRowValue(map);
        String nodeId = ObjectUtils.toString(dao.insert(ip));

        appendChild(entityCode, config, nodeId, pid, index);

        node.put(pidCode, pid);
        node.put(indexCode, index);
        node.put(metadata.getPkCode(), nodeId);
        eventManager.fire(entityCode, EntityEvent.POST_CREATE, node);
        return node;
    }

    public void deleteNode(String entityCode, TreeConfig config, String nodeId) throws BusinessException {
        Assert.isTrue(StringUtils.isNotBlank(entityCode), "deleteNode时，实体编码不能为空");
        if (config == null) {
            deleteById(entityCode, nodeId);
            return;
        }

        EntityMetadata metadata = metadataProvider.getEntityMetadata(entityCode);

        final String pkCode = metadata.getPkCode();
        final String pidCode = config.getPidCode();
        final String pathCode = config.getPathCode();

        ValueMap node = getById(entityCode, nodeId);

        if (StringUtils.isNotBlank(pidCode)) {
            removeChild(entityCode, config, nodeId, MapUtils.getString(node, pidCode));

            if (StringUtils.isNotBlank(pathCode)) {
                String path = MapUtils.getString(node, pathCode);
                delete(entityCode, Filter.field(pathCode).lLike(path));
            }

            List<ValueMap> list = list(entityCode, Filter.emptyFilter());
            TreeBuilder tb = new TreeBuilder(list) {
                public String getPid(ValueMap item) {
                    return MapUtils.getString(item, pidCode, "-1");
                }

                public String getId(ValueMap item) {
                    return MapUtils.getString(item, pkCode);
                }
            };

            List<ValueMap> nodeList = tb.getChildren(nodeId);
            List<String> ids = new ArrayList<String>();
            ids.add(nodeId);
            for (ValueMap item : nodeList) {
                ids.add(MapUtils.getString(item, pkCode));
            }
            delete(entityCode, Filter.field(pkCode).in(ids.toArray()));
        }
    }

    public List<ValueMap> getTree(String entityCode, TreeConfig config,List filterMaps) throws BusinessException {
        Assert.isTrue(StringUtils.isNotBlank(entityCode), "实体编码不能为空");
        Assert.notNull(config, "树形结构不能为空");

        final String pkCode = metadataProvider.getEntityMetadata(entityCode).getPkCode();
        final String pidCode = config.getPidCode();
        final String indexCode = config.getIndexCode();

        List<ValueMap> dataList = list(entityCode, createFilter(entityCode,filterMaps), new OrderBy().asc(indexCode));
        TreeBuilder tb = new TreeBuilder(dataList) {
            @Override
            public String getPid(ValueMap item) {
                return MapUtils.getString(item, pidCode, "-1");
            }

            @Override
            public String getId(ValueMap item) {
                return MapUtils.getString(item, pkCode);
            }
        };

        return tb.getTree("-1");
    }

    public List<ValueMap> getChildren(String entityCode, TreeConfig config, String parentId) throws BusinessException {
        Assert.isTrue(StringUtils.isNotBlank(entityCode), "实体编码不能为空");
        Assert.notNull(config, "树形结构不能为空");

        final String pidCode = config.getPidCode();
        final String indexCode = config.getIndexCode();

        return list(entityCode, Filter.field(pidCode).eq(parentId), new OrderBy().asc(indexCode));
    }

    public void updateNodePosition(String entityCode, TreeConfig config, String nodeId, String pid, int pos) throws BusinessException {
        final String pidCode = config.getPidCode();

        if (entityCode == null || nodeId == null || pid == null || pidCode == null) {
            throw new BusinessException("更新节点位置时参数错误");
        }

        ValueMap node = getById(entityCode, nodeId);
        String oldPid = MapUtils.getString(node, pidCode);

        removeChild(entityCode, config, nodeId, oldPid);
        appendChild(entityCode, config, nodeId, pid, pos);
    }

    private void removeChild(String entityCode, TreeConfig config, String nodeId, String pid) throws BusinessException {
        String pidCode = config.getPidCode();
        String indexCode = config.getIndexCode();

        ValueMap vm = new ValueMap();
        vm.put(pidCode, null);
        updateById(entityCode, nodeId, vm);

        if (StringUtils.isBlank(indexCode) || StringUtils.isBlank(pid)) {
            return;
        }
        ValueMap node = getById(entityCode, nodeId);
        Integer idx = MapUtils.getInteger(node, indexCode, -1);
        if (idx > -1) {
            vm.clear();
            EntityMetadata metadata = metadataProvider.getEntityMetadata(entityCode);
            vm.put(indexCode, new DBFunction(metadata.getFieldMetadataByFieldCode(indexCode).getColumnName() + "-1"));
            update(entityCode, vm, Filter.field(indexCode).gt(idx).and(pidCode).eq(pid));
        }
    }

    private void appendChild(String entityCode, TreeConfig config, String nodeId, String pid, Integer pos) {
        String pidCode = config.getPidCode();
        String indexCode = config.getIndexCode();

        EntityMetadata metadata = metadataProvider.getEntityMetadata(entityCode);
        if (StringUtils.isNotBlank(indexCode) && pos != null) {
            ValueMap vm = new ValueMap();
            vm.put(indexCode, new DBFunction(metadata.getFieldMetadataByFieldCode(indexCode).getColumnName() + "+1"));
            update(entityCode, vm, Filter.field(indexCode).ge(pos).and(pidCode).eq(pid));
        } else {
            QueryParam qp = new QueryParam(metadata.getTableName());
            qp.setFilter(Filter.field(pidCode).eq(pid));
            qp.addColumn("MAX(" + metadata.getFieldMetadataByFieldCode(indexCode).getColumnName() + ")", "maxIdx");

            ValueMap tmp = dao.get(qp);
            Integer maxIdx = MapUtils.getInteger(tmp, "maxIdx", 0);
            pos = maxIdx + 1;
        }

        ValueMap vm = new ValueMap();
        vm.put(pidCode, pid);
        vm.put(indexCode, pos);
        updateById(entityCode, nodeId, vm);

        String pathCode = config.getPathCode();
        if (StringUtils.isNotBlank(pathCode)) {
            updatePath(metadata, pid, pathCode, nodeId);
        }
    }

    private void updatePath(EntityMetadata metadata, String pid, String pathCode, String nodeId) {
        ValueMap node = getById(metadata.getCode(), nodeId);
        ValueMap parent = getById(metadata.getCode(), pid);

        String path = MapUtils.getString(node, pathCode);

        // target node has path already,getById all children use "like"
        if (StringUtils.isNotBlank(path)) {
            String pPath = MapUtils.getString(parent, pathCode, "-");
            String newPath = pPath + nodeId + "-";
            String pathCol = metadata.getFieldMetadataByFieldCode(pathCode).getColumnName();
            ValueMap vm = new ValueMap();
            vm.put(pathCode, new DBFunction("replace(" + pathCol + ",'" + path + "','" + newPath + "')"));
            update(metadata.getCode(), vm, Filter.field(pathCode).lLike(path));
        } else {// target node has no path,suppose target node is new created
            String pPath = MapUtils.getString(parent, pathCode, "-");
            ValueMap vm = new ValueMap();
            vm.put(pathCode, pPath + nodeId + "-");
            updateById(metadata.getCode(), nodeId, vm);
        }
    }
}

package org.delta.core.utils;

import org.apache.commons.lang.StringUtils;

import java.util.ArrayList;
import java.util.List;

/**
 * date: 2010-11-5
 * <p/>
 * version: 1.0
 * commonts: ......
 */
public abstract class TreeBuilder {
    private List<ValueMap> dataList;

    public TreeBuilder(List<ValueMap> dataList) {
        super();
        this.dataList = dataList;
    }

    public abstract String getPid(ValueMap item);
    public abstract String getId(ValueMap item);
    protected ValueMap createNode(ValueMap item){
        return item;
    }

    public List<ValueMap> getTree(String nodeId) {
        List<ValueMap> ret = new ArrayList<ValueMap>();

        List<ValueMap> topNode = getChildrenByParentId(nodeId);
        for (ValueMap item : topNode) {
            ret.add(getNode(item));
        }
        return ret;
    }

    public List<ValueMap> getChildren(String nodeId){
        List<ValueMap> ret = new ArrayList<ValueMap>();
        List<ValueMap> cs = getChildrenByParentId(nodeId);
        ret.addAll(cs);
        for(ValueMap item:cs){
            ret.addAll(getChildren(getId(item)));
        }
        return ret;
    }

    private ValueMap getNode(ValueMap data) {
        ValueMap ret = createNode(data);
        String id = getId(data);
        List<ValueMap> children = getChildrenByParentId(id);
        ret.put("loaded", true);
        if (children.size() > 0) {
            List<ValueMap> childNodes = new ArrayList<ValueMap>();
            for (ValueMap item : children) {
                childNodes.add(getNode(item));
            }

            ret.put("children", childNodes);
            ret.put("loaded", false);
        }
        return ret;
    }

    private List<ValueMap> getChildrenByParentId(String id) {
        List<ValueMap> ret = new ArrayList<ValueMap>();
        if (StringUtils.isNotBlank(id)) {
            for (ValueMap item : dataList) {
                String pid = getPid(item);
                if (id.equals(pid)) {
                    ret.add(item);
                }
            }
        }
        return ret;
    }
}



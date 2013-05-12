package org.delta.system.service;

import org.delta.core.dao.Filter;
import org.delta.core.dao.OrderBy;
import org.delta.core.entity.service.EntityService;
import org.delta.core.entity.service.TreeEntityService;
import org.delta.core.metadata.service.MetadataProvider;
import org.delta.core.utils.ValueMap;
import org.delta.system.SystemEntity;
import org.apache.commons.collections.CollectionUtils;
import org.apache.commons.collections.MapUtils;
import org.apache.commons.lang.StringUtils;
import org.apache.log4j.Logger;
import org.springframework.stereotype.Service;

import javax.annotation.PostConstruct;
import javax.annotation.Resource;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * date: 2010-7-27
 * <p/>
 * version: 1.0
 * commonts: ......
 */
@Service
public class BizCodeService {
    private static Logger logger = Logger.getLogger(BizCodeService.class);

    private static Map<String, List<ValueMap>> bizTypeMap = new HashMap<String, List<ValueMap>>();
    private static Map<String, ValueMap> bizCodeMap = new HashMap<String, ValueMap>();

    private String code_key = "code";
    private String typeCode_key = "typeCode";

    @Resource
    private MetadataProvider metadataProvider;
    @Resource
    private TreeEntityService treeEntityService;
    @Resource
    private EntityService entityService;

    @PostConstruct
    public void load() {
        List<ValueMap> typeList = entityService.list(SystemEntity.BIZ_TYPE, Filter.emptyFilter(), new OrderBy().desc("id"));
        List<ValueMap> codeList = entityService.list(SystemEntity.BIZ_CODE, Filter.emptyFilter(), new OrderBy().desc("orderBy"));

        bizTypeMap.clear();
        bizCodeMap.clear();

        for (ValueMap type : typeList) {
            String code = MapUtils.getString(type, "code");
            for (ValueMap map : codeList) {
                List<ValueMap> bizCodeList = bizTypeMap.get(code);
                if (CollectionUtils.isEmpty(bizCodeList)) {
                    bizCodeList = new ArrayList<ValueMap>();
                    bizTypeMap.put(code, bizCodeList);
                }
                String typeCode = MapUtils.getString(map, "typeCode");
                if (StringUtils.isNotEmpty(typeCode) && typeCode.equals(code)) {
                    bizCodeList.add(map);
                    bizCodeMap.put(MapUtils.getString(map, "id"), map);
                }
            }
        }

//        Iterator<Entry<String, List<Map>>> it = bizTypeMap.entrySet().iterator();
//        while (it.hasNext()) {
//            List<Map> list = it.next().getValue();
//            List<Map> treeList = TreeProcess.buildTree(list, -1, new TreeProcessHelper("id", "pid"));
//            list = treeList;
//        }
    }

    public static Map getBizCodeById(int id) {
        return (Map) bizCodeMap.get(Integer.toString(id));
    }

    public static Map<String, List<ValueMap>> getBizTypeMap() {
        return bizTypeMap;
    }

    public static String[] getBizVslues(String code) {
        List<ValueMap> list = bizTypeMap.get(code);
        if (CollectionUtils.isEmpty(list))
            return null;

        List<String> res = new ArrayList<String>();
        for (Map map : list) {
            String dbValue = MapUtils.getString(map, "value");
            res.add(dbValue);
        }
        return res.toArray(new String[res.size()]);
    }

    public static String getBizName(String code, String value) {
        List<ValueMap> list = bizTypeMap.get(code);
        if (CollectionUtils.isEmpty(list))
            return null;

        List<String> res = new ArrayList<String>();
        for (Map map : list) {
            String dbValue = MapUtils.getString(map, "value");
            if (dbValue != null && dbValue.equals(value)) {
                return MapUtils.getString(map, "text");
            }
        }
        return null;
    }
}



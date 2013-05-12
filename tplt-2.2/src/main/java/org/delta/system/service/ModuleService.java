package org.delta.system.service;

import org.delta.core.dao.Filter;
import org.delta.core.entity.service.EntityService;
import org.delta.core.exception.BusinessException;
import org.delta.core.metadata.service.MetadataProvider;
import org.delta.core.utils.ValueMap;
import org.delta.security.IUser;
import org.delta.spring.holder.AppContextHolder;
import org.delta.system.JsonFunction;
import org.delta.system.SystemEntity;
import org.apache.commons.collections.MapUtils;
import org.apache.commons.lang.StringUtils;
import org.apache.log4j.Logger;
import org.codehaus.jackson.JsonParser;
import org.codehaus.jackson.map.ObjectMapper;
import org.springframework.stereotype.Service;

import javax.annotation.Resource;
import java.io.IOException;
import java.util.*;

@Service
public class ModuleService {
    private final Logger logger = Logger.getLogger(ModuleService.class);

    @Resource
    EntityService entityService;
    @Resource
    MetadataProvider metadataProvider;

    public void saveModule(String mid, ValueMap module) {
        if (StringUtils.isBlank(mid)) {
            throw new BusinessException("模块ID不允许为空");
        }

        ValueMap m = entityService.getById(SystemEntity.MODULE, mid);

        if (m == null) {
            entityService.create(SystemEntity.MODULE, module);
        } else {
            entityService.updateById(SystemEntity.MODULE, mid, module);
        }
    }

    public void deleteModule(String id) throws BusinessException {
        entityService.deleteById(SystemEntity.MODULE, id);
    }

    public List<ValueMap> getModuleNodes() {
        List<ValueMap> ret = new ArrayList<ValueMap>();
        try {
            List<ValueMap> modules = entityService.list("moduleView", Filter.emptyFilter(), null);
            Map<String, ValueMap> temp = new HashMap<String, ValueMap>();
            for (ValueMap module : modules) {
                String cat = MapUtils.getString(module, "category", "Modules");
                ValueMap catNode = temp.get(cat);
                if (catNode == null) {
                    catNode = new ValueMap();
                    catNode.put("text", cat);
                    catNode.put("id", cat);
                    catNode.put("children", new ArrayList<ValueMap>());
                    catNode.put("leaf", false);
                    catNode.put("type", "category");

                    temp.put(cat, catNode);
                }

                ValueMap item = new ValueMap();
                item.put("text", MapUtils.getString(module, "name"));
                item.put("id", MapUtils.getString(module, "moduleId"));
                item.put("iconCls", MapUtils.getString(module, "iconCls"));
                item.put("leaf", false);
                item.put("type", "module");

                ((List<ValueMap>) catNode.get("children")).add(item);
            }

            for (String s : temp.keySet()) {
                ret.add(temp.get(s));
            }
        } catch (Exception e) {
            logger.error(e);
        }

        return ret;
    }

    public List<ValueMap> getComNodes(String moduleId) {
        List<ValueMap> ret = new ArrayList<ValueMap>();
        try {
            Map module = entityService.getById(SystemEntity.MODULE, moduleId);
            String config = MapUtils.getString(module, "xdsConfig");
            ObjectMapper mapper = new ObjectMapper();
            mapper.configure(JsonParser.Feature.ALLOW_UNQUOTED_FIELD_NAMES, true);
            mapper.configure(JsonParser.Feature.ALLOW_SINGLE_QUOTES, true);
            ValueMap xdsCofnig = mapper.readValue(config, ValueMap.class);
            Object comps = xdsCofnig.get("cn");
            Map mUserConfig = (Map) xdsCofnig.get("userConfig");
            String defCom = MapUtils.getString(mUserConfig, "defaultComponent", "_empty");
            if (comps != null) {
                List<Map> comList = (List<Map>) comps;
                for (Map com : comList) {
                    ValueMap item = new ValueMap();
                    Map userConfig = (Map) com.get("userConfig");
                    String cid = MapUtils.getString(com,"cid","");
                    if(cid.equals("fn")){
                        item.put("text", MapUtils.getString(userConfig, "functionName"));
                        item.put("comId", MapUtils.getString(userConfig, "functionName"));
                    }else{
                        item.put("text", MapUtils.getString(userConfig, "title"));
                        item.put("comId", MapUtils.getString(userConfig, "id"));
                    }
                    item.put("mid", moduleId);
                    item.put("cid", cid);
                    item.put("leaf", true);
                    item.put("type", "component");

                    if (StringUtils.equalsIgnoreCase(MapUtils.getString(userConfig, "id", "empty_"), defCom)) {
                        item.put("isDefault", true);
                    }

                    ret.add(item);
                }
            }
        } catch (Exception e) {
            logger.error(e);
            throw new BusinessException("加载模块组件错误",e);
        }

        return ret;
    }

    public ValueMap getComponentXdsConfig(String mid, String comId) {
        ValueMap ret = new ValueMap();
        try {
            ValueMap module = entityService.getById(SystemEntity.MODULE, mid);
            String config = MapUtils.getString(module, "xdsConfig");
            ObjectMapper mapper = new ObjectMapper();
            mapper.configure(JsonParser.Feature.ALLOW_UNQUOTED_FIELD_NAMES, true);
            mapper.configure(JsonParser.Feature.ALLOW_SINGLE_QUOTES, true);
            ValueMap xdsConfig = mapper.readValue(config, ValueMap.class);
            List<Map> comps = (List<Map>) xdsConfig.get("cn");
            for (Map com : comps) {
                Map userConfig = (Map) com.get("userConfig");
                if (StringUtils.equalsIgnoreCase(MapUtils.getString(userConfig, "id"), comId)) {
                    ret.put("xdsConfig", com);
                }
            }
        } catch (Exception e) {
            logger.error(e);
            throw new BusinessException("加载模块组件错误",e);
        }
        return ret;
    }

    private Map getComponentConfig(String mid, String comId) {
        try {
            ValueMap module = entityService.getById(SystemEntity.MODULE, mid);
            String config = MapUtils.getString(module, "config");
            ObjectMapper mapper = new ObjectMapper();
            mapper.configure(JsonParser.Feature.ALLOW_UNQUOTED_FIELD_NAMES, true);
            mapper.configure(JsonParser.Feature.ALLOW_SINGLE_QUOTES, true);
            ValueMap xdsConfig = mapper.readValue(config, ValueMap.class);
            List<Map> comps = (List<Map>) xdsConfig.get("components");
            for (Map com : comps) {
                if (StringUtils.equalsIgnoreCase(MapUtils.getString(com, "id"), comId)) {
                    return com;
                }
            }
        } catch (Exception e) {
            logger.error(e);
        }
        return null;
    }

    public ValueMap getModuleXdsConfig(String mid) {
        try {
            ValueMap module = entityService.getById(SystemEntity.MODULE, mid);
            String config = MapUtils.getString(module, "xdsConfig");
            ObjectMapper mapper = new ObjectMapper();
            mapper.configure(JsonParser.Feature.ALLOW_UNQUOTED_FIELD_NAMES, true);
            mapper.configure(JsonParser.Feature.ALLOW_SINGLE_QUOTES, true);
            ValueMap xdsConfig = mapper.readValue(config, ValueMap.class);
            List<Map> comps = (List<Map>) xdsConfig.get("cn");
            List<Map> refcns = (List<Map>) xdsConfig.get("refcn");
            if (refcns != null) {
                for (Map refcom : refcns) {
                    String refMid = MapUtils.getString(refcom, "refMid");
                    String comId = MapUtils.getString(refcom, "comId");
                    Map comCfg = this.getComponentXdsConfig(refMid, comId);
                    if (comCfg != null) {
                        comCfg = (Map) comCfg.get("xdsConfig");
                        comCfg.put("isRef", true);
                        comCfg.put("refMid", refMid);
                        if (comps == null) {
                            comps = new ArrayList<Map>();
                            xdsConfig.put("cn", comps);
                        }
                        comps.add(comCfg);
                    }
                }
                xdsConfig.remove("refcn");
            }
            return xdsConfig;
        } catch (Exception e) {
            logger.error(e);
            throw new BusinessException("读取模块配置出错",e);
        }
    }

    public ValueMap getModuleConfig(String mid) throws IOException {
        ValueMap module = entityService.getById(SystemEntity.MODULE, mid);

        if(module == null){
            throw new BusinessException("未找到模块["+mid+"]");
        }

        String config = MapUtils.getString(module, "config");
        ObjectMapper mapper = new ObjectMapper();
        mapper.configure(JsonParser.Feature.ALLOW_UNQUOTED_FIELD_NAMES, true);
        mapper.configure(JsonParser.Feature.ALLOW_SINGLE_QUOTES, true);
        ValueMap ret = mapper.readValue(config, ValueMap.class);

        List<Map> comps = (List<Map>) ret.get("components");
        List<Map> refComs = (List<Map>) ret.get("refComponents");
        if (refComs != null) {
            for (Map refcom : refComs) {
                String refMid = MapUtils.getString(refcom, "refMid");
                String comId = MapUtils.getString(refcom, "comId");
                Map comCfg = this.getComponentConfig(refMid, comId);
                if (comCfg != null) {
                    if (comps == null) {
                        comps = new ArrayList<Map>();
                        ret.put("components", comps);
                    }
                    comps.add(comCfg);
                }
            }
            ret.remove("refComponents");
        }
        processJsonFunction(ret);
        return ret;
    }

    private void processJsonFunction(Map<String,Object> map) {
        if (map.isEmpty()) {
            return;
        }

        List<String> noPerm = new ArrayList<String>();

        for (String key : map.keySet()) {
            Object value = map.get(key);
            if (value instanceof Map) {
                Map<String,Object> subNode = (Map<String,Object>) value;
                if (!hasPerm(subNode, AppContextHolder.getLoginUser())) {
                    noPerm.add(key);
                    continue;
                }
                if (MapUtils.getBooleanValue(subNode, "isFn")) {
                    map.put(key, createJsonFunction(subNode));
                } else {
                    processJsonFunction(subNode);
                }
            } else if (value instanceof List) {
                List valueList = (List) value;
                List tmp = new ArrayList();
                for (Object subValue : valueList) {
                    if (subValue instanceof Map) {
                        if (!hasPerm((Map) subValue, AppContextHolder.getLoginUser())) {
                            tmp.add(subValue);
                            continue;
                        }
                        processJsonFunction((Map<String,Object>)subValue);
                    }
                }

                if (tmp.size() > 0) {
                    for (Object v : tmp) {
                        valueList.remove(v);
                    }
                }
            }
        }

        for (String key : noPerm) {
            map.remove(key);
        }
    }

    private JsonFunction createJsonFunction(Map map) {
        String body = MapUtils.getString(map, "value", "");
        JsonFunction jf = new JsonFunction(body);
        List<String> args = (List<String>) MapUtils.getObject(map, "params", new ArrayList<String>());
        for (String arg : args) {
            jf.getParams().add(arg);
        }
        return jf;
    }

    private boolean hasPerm(Map node, IUser user) {
        String permCode = MapUtils.getString(node, "permissionId");
        return !StringUtils.isNotBlank(permCode) || user.hasPerm(permCode);
    }

    public ValueMap getRtConfig(String jsonConfig) throws IOException {
        ObjectMapper mapper = new ObjectMapper();
        mapper.configure(JsonParser.Feature.ALLOW_UNQUOTED_FIELD_NAMES, true);
        mapper.configure(JsonParser.Feature.ALLOW_SINGLE_QUOTES, true);
        ValueMap ret = mapper.readValue(jsonConfig, ValueMap.class);
        processJsonFunction(ret);
        return ret;
    }
}

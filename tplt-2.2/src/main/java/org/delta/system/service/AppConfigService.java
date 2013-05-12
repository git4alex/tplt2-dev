package org.delta.system.service;

import org.apache.commons.collections.MapUtils;
import org.apache.commons.lang.StringUtils;
import org.codehaus.jackson.map.ObjectMapper;
import org.delta.core.dao.Filter;
import org.delta.core.dao.OrderBy;
import org.delta.core.entity.TreeConfig;
import org.delta.core.entity.service.EntityService;
import org.delta.core.entity.service.TreeEntityService;
import org.delta.core.exception.BusinessException;
import org.delta.core.metadata.EntityMetadata;
import org.delta.core.metadata.MetadataConst;
import org.delta.core.metadata.service.MetadataProvider;
import org.delta.core.utils.TreeBuilder;
import org.delta.core.utils.ValueMap;
import org.delta.security.IUser;
import org.delta.security.User;
import org.delta.system.SystemEntity;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;

import javax.annotation.Resource;
import java.io.IOException;
import java.util.ArrayList;
import java.util.Collection;
import java.util.List;
import java.util.Map;

@Service
public class AppConfigService {

    @Resource
    private MetadataProvider metadataProvider;
    @Resource
    private EntityService entityService;
    @Resource
    private TreeEntityService treeEntityService;

    public ValueMap getAppConfig() throws BusinessException {
        UserDetails ud = (UserDetails) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        IUser user = getUser(ud);
        ValueMap config = new ValueMap();
        config.put("user", user.getDataMap());
        config.put("menuList", getMenuList(user));
        config.put("bizCode", BizCodeService.getBizTypeMap());

        return config;
    }

    public IUser getUser(UserDetails uds) throws BusinessException {
        String userId = uds.getUsername();
        ValueMap userMap = entityService.getById(SystemEntity.USER, userId);
        userMap.remove("password");

        List<String> perms = new ArrayList<String>();
        Collection<? extends GrantedAuthority > gas = uds.getAuthorities();
        for (GrantedAuthority ga : gas) {
            perms.add(ga.getAuthority());
        }
        userMap.put("perms", perms);
        userMap.put("roles", getRoleList(userId));

        String orgId = MapUtils.getString(userMap, "orgId");
        if (StringUtils.isNotBlank(orgId)) {
            ValueMap org = entityService.getById(SystemEntity.ORG, orgId);
            userMap.put("orgName", MapUtils.getString(org, "fullName"));
            userMap.put("orgCode", MapUtils.getString(org, "code"));
            userMap.put("orgBizCode", MapUtils.getString(org, "bizCode"));
            userMap.put("orgType", MapUtils.getString(org, "type"));
            userMap.put("orgPid", MapUtils.getString(org, "pid"));
        }

        return new User(userMap);
    }

    private List<String> getRoleList(String userId) throws BusinessException {
        List<String> roleList = new ArrayList<String>();
        Filter f = Filter.field("uid").eq(userId).and(Filter.field("urid").isNotNull());
        List<ValueMap> roles = entityService.list(SystemEntity.USER_ROLE_VIEW, f, null);
        if (roles != null && roles.size() > 0) {
            for (ValueMap role : roles) {
                String str = MapUtils.getString(role, "code");
                if (StringUtils.isNotBlank(str)) {
                    roleList.add(str);
                }
            }
        }

        return roleList;
    }

    public List<ValueMap> getMenuList(IUser user) throws BusinessException {
        final TreeConfig treeConfig = new TreeConfig("pid", "orderBy", null);
        final EntityMetadata metadata = metadataProvider.getEntityMetadata(SystemEntity.USER_MENU);
        List<ValueMap> list = entityService.list(SystemEntity.USER_MENU, Filter.field("userId").eq(user.getId()), new OrderBy().asc("orderBy"));
        TreeBuilder tb = new TreeBuilder(list) {
            public String getPid(ValueMap item) {
                return MapUtils.getString(item, treeConfig.getPidCode());
            }

            public String getId(ValueMap item) {
                return MapUtils.getString(item, metadata.getPkCode());
            }

            public ValueMap createNode(ValueMap item) {
                ValueMap ret = new ValueMap();
                ret.put("iconCls", MapUtils.getString(item, "iconCls"));
                ret.put("menuId", MapUtils.getString(item, "menuId"));
                ret.put("moduleId", MapUtils.getString(item, "moduleId"));
                ret.put("orderBy", MapUtils.getString(item, "orderBy"));
                ret.put("pid", MapUtils.getString(item, "pid"));
                ret.put("remark", MapUtils.getString(item, "remark"));
                ret.put("text", MapUtils.getString(item, "text"));
                ret.put("xtype", MapUtils.getString(item, "xtype"));
                return ret;
            }
        };

        return tb.getTree("-1");
    }

    /**
     * getById config by type and ids
     *
     * @param params {type:[id1,id2],type2:[id1,id2]}
     * @return configs on json format
     */
    public String getJsonConfig(Map<String, List<String>> params) {
        ValueMap configMap = new ValueMap();
        for (String configType : params.keySet()) {
            List<String> ids = params.get(configType);
            List<ValueMap> configs = getConfigs(configType, ids);
            configMap.put(configType, configs);
        }

        String ret = "{}";
        ObjectMapper mapper = new ObjectMapper();
        try {
            ret = mapper.writeValueAsString(configMap);
        } catch (IOException e) {
            e.printStackTrace();
        }

        return ret;
    }

    private List<ValueMap> getConfigs(String type, List<String> ids) {
        List<ValueMap> ret = new ArrayList<ValueMap>();
        if ("Module".equalsIgnoreCase(type)) {
            Filter f = Filter.field("id").in(ids);
            ret = entityService.list(SystemEntity.MODULE, f);
        } else if ("Entity".equalsIgnoreCase(type)) {
            for (String id : ids) {
                ValueMap entityMap = entityService.getById(MetadataConst.CODE_ENTITY_METADATA, id);
                List<ValueMap> fields = entityService.list(MetadataConst.CODE_FIELD_METADATA, Filter.field(MetadataConst.FieldMetadataField.entityCode.toString()).eq(id));
                entityMap.put("fields", fields);
                ret.add(entityMap);
            }
        }
        return ret;
    }

    /**
     * updateById config from uploaded file
     *
     * @param configMap format:{type:[{config1},{config2}],type2:[{config1},{config2}]}
     */
    public void updateJsonConfig(ValueMap configMap) throws BusinessException {
        for (String configType : configMap.keySet()) {
            List<ValueMap> configs = (List<ValueMap>) configMap.get(configType);
            for (ValueMap config : configs) {
                updateConfig(configType, config);
            }
        }
    }

    private void updateConfig(String type, ValueMap config) throws BusinessException {
        if (SystemEntity.MODULE.equalsIgnoreCase(type)) {
            config.remove("id");
            String moduleId = MapUtils.getString(config, "moduleId");
                ValueMap target = entityService.get(SystemEntity.MODULE, Filter.field("moduleId").eq(moduleId));
                if (target != null) {
                    entityService.updateById(SystemEntity.MODULE, moduleId, config);
                } else {
                    entityService.create(SystemEntity.MODULE, config);
                }

        } else if (MetadataConst.CODE_ENTITY_METADATA.equalsIgnoreCase(type)) {
            List<ValueMap> fields = (List<ValueMap>) config.get("fields");
            config.remove("fields");
            String code = MapUtils.getString(config, "code");
            config.remove("code");

            ValueMap entityMap = entityService.getById(MetadataConst.CODE_ENTITY_METADATA,code);

            if (entityMap == null) {
                config.put("pid", -1);
                entityService.create(MetadataConst.CODE_ENTITY_METADATA,config);
            } else {
                entityService.updateById(MetadataConst.CODE_ENTITY_METADATA,code,config);
                entityService.delete(MetadataConst.CODE_FIELD_METADATA,Filter.field(MetadataConst.FieldMetadataField.entityCode.toString()).eq(code));
            }

            for (ValueMap field : fields) {
                field.put(MetadataConst.FieldMetadataField.entityCode.toString(), code);
                entityService.create(MetadataConst.CODE_FIELD_METADATA,field);
            }
        }
    }
}

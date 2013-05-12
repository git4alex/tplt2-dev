package org.delta.system.entityEventHandler;

import org.delta.core.dao.Filter;
import org.delta.core.entity.EntityEventListener;
import org.delta.core.entity.TreeConfig;
import org.delta.core.entity.service.TreeEntityService;
import org.delta.core.exception.BusinessException;
import org.delta.core.utils.ValueMap;
import org.apache.commons.collections.MapUtils;
import org.apache.commons.lang.StringUtils;
import org.apache.log4j.Logger;
import org.springframework.stereotype.Component;

import javax.annotation.Resource;

@Component
public class MenuEventHandler extends EntityEventListener {
    private Logger logger = Logger.getLogger(this.getClass());
    @Resource
    private TreeEntityService treeEntityService;

    @Override
    public boolean accept(String entityCode) {
        return "menu".equalsIgnoreCase(entityCode);
    }

    public void afterCreate(Object data) throws BusinessException {
        ValueMap vm = (ValueMap) data;
        if (MapUtils.getBooleanValue(vm, "createPerm", false)) {
            String permCode = MapUtils.getString(vm, "permCode");
            if (StringUtils.isNotBlank(permCode)) {
                ValueMap permData = createMenuPermission(vm);
                treeEntityService.createNode("permission", getPermTreeConfig(), permData);
            }
        }
    }

    private TreeConfig getPermTreeConfig() {
        return new TreeConfig("pid", "orderBy", null);
    }

    private ValueMap createMenuPermission(ValueMap menu) {
        ValueMap perm = new ValueMap();
        perm.put("code", MapUtils.getString(menu, "permCode"));
        perm.put("text", MapUtils.getString(menu, "text"));

        int menuPid = MapUtils.getIntValue(menu, "pid", -1);
        int permPid = getPermPid(menuPid);

        perm.put("pid", permPid);
        perm.put("type", "MENU");

        return perm;
    }

    private int getPermPid(int menuPid) {
        int ret = -1;
        if (menuPid > 0) {
            try {
                ValueMap parentMenu = treeEntityService.getById("menu", menuPid + "");
                String parentPermCode = MapUtils.getString(parentMenu, "permCode");
                if (StringUtils.isNotBlank(parentPermCode)) {
                    ValueMap parentPerm = treeEntityService.get("permission", Filter.field("code").eq(parentPermCode));
                    if (parentPerm != null) {
                        ret = MapUtils.getIntValue(parentPerm, "id");
                    }
                }
            } catch (BusinessException e) {
                e.printStackTrace();
            }
        }

        return ret;
    }
}

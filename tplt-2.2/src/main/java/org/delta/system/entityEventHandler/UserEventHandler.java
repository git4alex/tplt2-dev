package org.delta.system.entityEventHandler;

import org.delta.core.dao.Dao;
import org.delta.core.dao.Filter;
import org.delta.core.dao.UpdateParam;
import org.delta.core.entity.EntityEventListener;
import org.delta.core.exception.BusinessException;
import org.delta.core.metadata.service.MetadataProvider;
import org.delta.core.utils.ValueMap;
import org.apache.commons.collections.MapUtils;
import org.apache.log4j.Logger;
import org.springframework.security.authentication.encoding.Md5PasswordEncoder;
import org.springframework.stereotype.Component;

import javax.annotation.Resource;

@Component
public class UserEventHandler extends EntityEventListener {
	private Logger logger = Logger.getLogger(this.getClass());

	@Resource
	private Dao dao;
	@Resource
	private MetadataProvider metadataprovider;

	@Override
	public boolean accept(String entityCode) {
		return "user".equalsIgnoreCase(entityCode);
	}

    @Override
    public void afterCreate(Object data) throws BusinessException {
        if(data instanceof ValueMap){
            ValueMap vm = (ValueMap) data;
            String username = MapUtils.getString(vm,"id");
            String password = MapUtils.getString(vm,"password");
            vm.clear();
            vm.put("PASSWORD",encodePwd(username,password));
            UpdateParam up = new UpdateParam("SYS_USER");
            up.setColumnValue(vm);
            up.setFilter(Filter.field("ID").eq(username));
            dao.update(up);
        }
    }

    @Override
    public void beforeUpdate(Object data) throws BusinessException {
        if(data instanceof ValueMap){
            ValueMap vm = (ValueMap) data;
            vm.remove("password");
        }
    }

    private String encodePwd(String username,String password){
        return new Md5PasswordEncoder().encodePassword(password,username);
    }
}

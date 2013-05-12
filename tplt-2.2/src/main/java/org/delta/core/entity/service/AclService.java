package org.delta.core.entity.service;

import org.delta.core.dao.Dao;
import org.delta.core.dao.OrderBy;
import org.delta.core.dao.QueryParam;
import org.delta.core.entity.acl.AclException;
import org.delta.core.entity.acl.AclRule;
import org.delta.core.utils.ValueMap;
import org.delta.security.IUser;
import org.delta.spring.holder.AppContextHolder;
import org.apache.commons.lang.StringUtils;
import org.springframework.stereotype.Service;

import javax.annotation.PostConstruct;
import javax.annotation.Resource;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class AclService {
    public static String ACL_TABLE = "SYS_ACL_RULE";

	@Resource
	private Dao dao;

	private static Map<String,List<AclRule>> ruleMap=new HashMap<String,List<AclRule>>();

	@PostConstruct
	private void loadAclRules(){
		ruleMap.clear();

		QueryParam qp=new QueryParam(ACL_TABLE);
		qp.setOrderBy(new OrderBy().desc("entity_code").desc("priority"));
		List<ValueMap> rules=dao.list(qp);

		if(rules!=null){
			for(ValueMap value:rules){
				AclRule rule=new AclRule(value);
				String ec=rule.getEntityCode();
				List<AclRule> rs=ruleMap.get(ec);
				if(rs == null){
					rs=new ArrayList<AclRule>();
					ruleMap.put(ec, rs);
				}

				rs.add(rule);
			}
		}
	}

	public void validate(IUser user,String entityCode,ValueMap value) throws AclException {

	}

	public String getAccessFilter(String entityCode) throws AclException{
        IUser user = AppContextHolder.getLoginUser();
		if(StringUtils.isBlank(entityCode)){
			return null;
		}

		List<AclRule> rules=ruleMap.get(entityCode);
		Integer priority = null;
		if(rules!=null && rules.size()>0){
			List<String> ret = new ArrayList<String>();
			for(AclRule rule:rules){
				if(rule.enable(user)){
					String fs = rule.getFilterString(user);
					if (StringUtils.isBlank(fs)) {
						continue;
					}

					if (priority != null) {
						if (rule.getPriority() == priority) {
							ret.add("(" + fs + ")");
						}
					} else {
						priority = rule.getPriority();
						ret.add("(" + fs + ")");
					}

				}
			}

			if (ret.size() > 0) {
				return "AND (" + StringUtils.join(ret.iterator(), " OR ") + ")";
			}
		}

		return null;
	}

	public void setDao(Dao dao){
		this.dao=dao;
	}

	public void reload(){
		this.loadAclRules();
	}
}

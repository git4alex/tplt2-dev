package org.delta.system.service;

import org.delta.core.dao.Filter;
import org.delta.core.entity.service.EntityService;
import org.delta.core.metadata.EntityMetadata;
import org.delta.core.metadata.service.MetadataProvider;
import org.delta.core.utils.ValueMap;
import org.delta.system.SystemEntity;
import org.apache.commons.collections.MapUtils;
import org.apache.log4j.Logger;
import org.springframework.stereotype.Service;

import javax.annotation.PostConstruct;
import javax.annotation.Resource;
import java.util.List;

/**
 * date: 2010-7-27
 *
 * version: 1.0
 * commonts: ......
 */
@Service
public class OrgService {
	private static Logger logger = Logger.getLogger(OrgService.class);

	private static ValueMap orgMap = null;

	@Resource
	private MetadataProvider metadataProvider;
	@Resource
	private EntityService entityService;

	@PostConstruct
	public void load() {
		orgMap = new ValueMap();
        EntityMetadata metadata = metadataProvider.getEntityMetadata(SystemEntity.ORG);
        List<ValueMap> list = entityService.list(SystemEntity.ORG, Filter.emptyFilter(), null);
        for (ValueMap map : list) {
            orgMap.put(MapUtils.getString(map, metadata.getPkCode()), map);
        }
	}

	public ValueMap getOrg(String id) {
		if (orgMap == null) {
			load();
		}
		return (ValueMap) orgMap.get(id);
	}
}



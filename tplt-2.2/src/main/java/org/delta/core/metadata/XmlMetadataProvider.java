package org.delta.core.metadata;

import org.apache.log4j.Logger;
import org.springframework.stereotype.Repository;

import javax.annotation.Resource;
import java.util.Map;


/**
 * version: 1.0
 * commonts: ......
 */
@Repository
public class XmlMetadataProvider {
    private static Logger logger = Logger.getLogger(XmlMetadataProvider.class);

    private static Map<String, EntityMetadata> xmlMetadataMap;

    @Resource
    public void setList(Map<String, EntityMetadata> configMetadataManager) {
        XmlMetadataProvider.xmlMetadataMap = configMetadataManager;
        if (configMetadataManager != null) {
            for (String key : configMetadataManager.keySet()) {
                EntityMetadata metadata = configMetadataManager.get(key);
                metadata.setCode(key);
            }
        }
    }

    public EntityMetadata getEntityMetadata(String code) {
        return xmlMetadataMap.get(code);
    }
}


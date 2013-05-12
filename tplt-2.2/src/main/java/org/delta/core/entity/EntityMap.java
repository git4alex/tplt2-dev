package org.delta.core.entity;

import org.delta.core.metadata.EntityMetadata;
import org.delta.core.utils.ValueMap;
import org.apache.log4j.Logger;
import org.springframework.util.Assert;

/**
 * 实体对象
 * <p/>
 * User: Jeff
 * <p/>
 * Date: 12-11-15 下午5:46
 */
public class EntityMap extends ValueMap {

    private Logger log = Logger.getLogger(EntityMap.class);

    private EntityMetadata metadata;

    private String entityCode;

    /**
     * 通过实体代码，自动获取实体元数据
     *
     * @param entityCode
     */
    public EntityMap(String entityCode) {
        Assert.notNull(entityCode, "entityCode 必须不为空 ");
        this.entityCode = entityCode;
    }


    public String getEntityCode(){
        return this.entityCode;
    }

    public EntityMetadata getMetadata() {
        return metadata;
    }
}

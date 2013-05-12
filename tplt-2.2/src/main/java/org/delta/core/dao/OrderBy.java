package org.delta.core.dao;

import org.apache.commons.lang.StringUtils;
import org.springframework.util.Assert;

import java.util.HashMap;
import java.util.Map;

/**
 * date: 2010-12-10
 * <p/>
 * version: 1.0
 * commonts: ......
 */
public class OrderBy {
    public enum Dir {
        asc,
        desc
    }

    private Map<String, Dir> data = new HashMap<String, Dir>();

    public OrderBy() {
    }

    public OrderBy desc(String field) {
        Assert.isTrue(StringUtils.isNotBlank(field),"排序字段名不能为空");
        data.put(field, Dir.desc);
        return this;
    }

    public OrderBy asc(String field) {
        Assert.isTrue(StringUtils.isNotBlank(field),"排序字段名不能为空");
        data.put(field, Dir.asc);
        return this;
    }

    public String toString() {
        StringBuilder sb = new StringBuilder();
        for(Map.Entry<String,Dir> entry : data.entrySet()){
            sb.append(entry.getKey()).append(" ").append(entry.getValue()).append(",");
        }
        return StringUtils.substringBeforeLast(sb.toString(),",");
    }
}



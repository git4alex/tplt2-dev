package org.delta.core.utils;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

/**
 * User: Alex
 * Date: 13-1-11
 * Time: 下午12:09
 */
public class ValueMapUtil {
    public static List<ValueMap> convertList(List<Map<String,Object>> src){
        List<ValueMap> ret = new ArrayList<ValueMap>();
        for(Map item:src){
            ValueMap i = new ValueMap();
            i.putAll(item);
            ret.add(i);
        }
        return ret;
    }
}

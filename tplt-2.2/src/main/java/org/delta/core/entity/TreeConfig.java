package org.delta.core.entity;

import org.apache.commons.collections.MapUtils;

import java.util.Map;

/**
 * date: 2010-11-15
 * <p/>
 * version: 1.0 commonts: ......
 */
public class TreeConfig {
    public static String PID_CODE = "pidCode";
    public static String INDEX_CODE = "indexCode";
    public static String PATH_CODE = "pathCode";

    private String pidCode,indexCode,pathCode;

    public TreeConfig(String pidCode,String indexCode,String pathCode) {
        this.pidCode = pidCode;
        this.indexCode = indexCode;
        this.pathCode = pathCode;
    }

    public static TreeConfig getTreeConfig(Map parameter) {
        if (MapUtils.isEmpty(parameter)) {
            return null;
        }
        String pidCode = null;
        String indexCode = null;
        String pathCode = null;
        if (parameter.containsKey(PID_CODE)) {
            pidCode = MapUtils.getString(parameter, PID_CODE);
            parameter.remove(PID_CODE);
        }
        if (parameter.containsKey(INDEX_CODE)) {
            indexCode = MapUtils.getString(parameter, INDEX_CODE);
            parameter.remove(INDEX_CODE);
        }
        if (parameter.containsKey(PATH_CODE)) {
            pathCode = MapUtils.getString(parameter, PATH_CODE);
            parameter.remove(PATH_CODE);
        }

        return new TreeConfig(pidCode,indexCode,pathCode);
    }

    public static TreeConfig getDefaultConfig() {
        return new TreeConfig("pid","seq","path");
    }

    public String getPidCode() {
        return pidCode;
    }

    public String getIndexCode() {
        return indexCode;
    }

    public String getPathCode() {
        return pathCode;
    }
}

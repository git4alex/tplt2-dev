package org.delta.core.dao;

import org.springframework.util.Assert;

/**
 * User: Alex
 * Date: 13-1-21
 * Time: 下午1:36
 */
public class SqlPlaceHolder {
    private String name = "";
    private Object value = null;

    public SqlPlaceHolder(String name,Object value){
        Assert.notNull(name,"sqlPlaceHolder name 不能为空");
        this.name = name;
        this.value = value;
    }

    public String toString(){
        return ":"+this.name;
    }

    public String getName(){
        return this.name;
    }

    public Object getValue(){
        return this.value;
    }
}

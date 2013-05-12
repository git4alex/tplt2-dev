package org.delta.system;

import org.delta.core.dao.Page;
import org.delta.core.utils.ValueMap;

import java.util.List;

/**
 * User: Alex
 * Date: 13-1-15
 * Time: 下午1:55
 */
public class Result extends ValueMap {
    public static String SUCCESS = "success";
    public static String ROOT = "root";
    public static String MESSAGE = "message";
    public static String DATA = "data";
    public static String START ="start";
    public static String LIMIT = "limit";
    public static String TOTAL_COUNT = "totalCount";

    private Result(){

    }

    public static Result error(String msg){
        Result ret = new Result();
        ret.put(SUCCESS,false);
        ret.put(MESSAGE,msg);
        return ret;
    }

    public static Result message(String msg){
        Result ret = new Result();
        ret.put(SUCCESS,true);
        ret.put(MESSAGE,msg);
        return ret;
    }

    public static Result success(){
        Result ret = new Result();
        ret.put(SUCCESS,true);
        return ret;
    }

    public static Result data(ValueMap vm){
        Result ret = new Result();
        ret.put(SUCCESS,true);
        ret.put(DATA,vm);
        return ret;
    }

    public static Result list(List<ValueMap> list){
        Result ret = new Result();
        if(list instanceof Page){
            Page page = (Page) list;
            ret.put(START,page.getStart());
            ret.put(LIMIT,page.getLimit());
            ret.put(TOTAL_COUNT,page.getTotalCount());
        }
        ret.put(ROOT,list);
        return ret;
    }
}

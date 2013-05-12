package org.delta.core.metadata.service;

import org.delta.core.dao.Dao;
import org.delta.core.dao.QueryParam;
import org.delta.core.dao.UpdateParam;
import org.delta.core.dao.Filter;
import org.delta.core.utils.ValueMap;
import org.apache.commons.collections.MapUtils;
import org.springframework.expression.ExpressionParser;
import org.springframework.expression.spel.standard.SpelExpressionParser;
import org.springframework.expression.spel.support.StandardEvaluationContext;
import org.springframework.stereotype.Service;

import javax.annotation.Resource;
import java.text.SimpleDateFormat;
import java.util.Date;

/**
 * User: Alex
 * Date: 13-1-7
 * Time: 下午4:50
 */
@Service
public class AutoGenService {
    public static final String AUTO_GEN_SEED_TAB = "SYS_AUTOGEN_SEED";

    @Resource
    private Dao dao;

    public String createNewValue(String type){
        QueryParam qp = new QueryParam(AUTO_GEN_SEED_TAB);
        qp.setFilter(Filter.field("type").eq(type));

        ValueMap ret = dao.get(qp);
        int seed = MapUtils.getInteger(ret,"seed");
        int seedLen = MapUtils.getInteger(ret,"seed_len",4);
        String pattern = MapUtils.getString(ret,"pattern");

        UpdateParam up = new UpdateParam(AUTO_GEN_SEED_TAB);
        up.setTableName(AUTO_GEN_SEED_TAB);
        ValueMap val = new ValueMap();
        val.put("seed",seed+1);
        up.setColumnValue(val);
        up.setFilter(Filter.field("type").eq(type));

        int c = dao.update(up);

        if(c>0){
            ExpressionParser parser=new SpelExpressionParser();
            StandardEvaluationContext context=new StandardEvaluationContext();
            context.setVariable("seed",String.format("%0"+seedLen+"d",seed+1));
            context.setVariable("date",new SimpleDateFormat("yyMMdd").format(new Date()));
            return parser.parseExpression(pattern).getValue(context,String.class);
        }else{
            return createNewValue(type);
        }
    }
}

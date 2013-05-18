package org.delta.activiti;

import org.activiti.bpmn.constants.BpmnXMLConstants;
import org.activiti.bpmn.model.BaseElement;
import org.activiti.bpmn.model.BpmnModel;
import org.apache.commons.collections.CollectionUtils;
import org.apache.commons.collections.MapUtils;
import org.apache.commons.lang.ArrayUtils;
import org.codehaus.jackson.JsonParser;
import org.codehaus.jackson.map.ObjectMapper;
import org.delta.activiti.parser.ProcessParser;
import org.delta.activiti.parser.StartEventParser;
import org.delta.activiti.parser.SubProcessParser;
import org.springframework.util.Assert;

import java.io.IOException;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * User: Alex
 * Date: 13-5-12
 * Time: 上午9:39
 */
public class BpmnJSONConverter implements BpmnXMLConstants {
    private Map<String, BpmnJsonParser> parserMap = new HashMap<String, BpmnJsonParser>();

    public BpmnJSONConverter(){
        addPaser(new ProcessParser());
        addPaser(new SubProcessParser());
        addPaser(new StartEventParser());
    }

    private void addPaser(BpmnJsonParser parser){
        String[] xtypes = parser.getXtypes();
        if(!ArrayUtils.isEmpty(xtypes)){
            for(String xtype:xtypes){
                parserMap.put(xtype,parser);
            }
        }

    }

    public BpmnModel convertToBpmnModel(String jsonDef){
        BpmnModel bpmnModel = new BpmnModel();
        try {
            HashMap jsonMap = new ObjectMapper().configure(JsonParser.Feature.ALLOW_UNQUOTED_FIELD_NAMES, true).readValue(jsonDef, HashMap.class);
            convert(jsonMap, bpmnModel);
        } catch (IOException e) {
            e.printStackTrace();
        }
        return bpmnModel;
    }

    private void convert(Map jsonMap,BpmnModel bpmnModel){
        String xtype = MapUtils.getString(jsonMap,"xtype");
        Assert.notNull(xtype,"xtype is null");

        BpmnJsonParser parser = parserMap.get(xtype);
        Assert.notNull(parser,"parser for:"+xtype+" is null");

        parser.parse(jsonMap,bpmnModel);

        List items = (List) MapUtils.getObject(jsonMap,"items");
        if(CollectionUtils.isNotEmpty(items)){
            BaseElement parent = (BaseElement) MapUtils.getObject(jsonMap,"parent");
            for(Object item:items){
                Map itemMap = (Map) item;
                itemMap.put("parent",parent);
                convert(itemMap,bpmnModel);
            }
        }
    }
}

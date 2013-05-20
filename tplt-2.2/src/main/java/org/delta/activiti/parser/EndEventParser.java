package org.delta.activiti.parser;

import org.activiti.bpmn.model.*;
import org.apache.commons.collections.MapUtils;
import org.delta.activiti.BpmnJsonParser;

import java.util.Map;

/**
 * User: Alex
 * Date: 13-5-20
 * Time: 上午10:21
 */
public class EndEventParser extends BpmnJsonParser {
    @Override
    public String[] getXtypes() {
        return new String[]{"noneend","errorend","cancelend"};
    }

    @Override
    protected BaseElement doParse(Map jsonMap, BaseElement parent, BpmnModel bpmnModel) {
        EndEvent endEvent = new EndEvent();

        String xtype = MapUtils.getString(jsonMap, "xtype");

        if ("errorend".equalsIgnoreCase(xtype)) {
            ErrorEventDefinition ed = new ErrorEventDefinition();
            String errorCode = MapUtils.getString(jsonMap, ATTRIBUTE_ERROR_REF);
            ed.setErrorCode(errorCode);

            endEvent.getEventDefinitions().add(ed);
        } else if("cancelend".equalsIgnoreCase(xtype)){
            CancelEventDefinition ced = new CancelEventDefinition();
            endEvent.getEventDefinitions().add(ced);
        }
        return endEvent;
    }
}

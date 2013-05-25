package org.delta.activiti.parser;

import org.activiti.bpmn.model.BaseElement;
import org.activiti.bpmn.model.BpmnModel;
import org.activiti.bpmn.model.StartEvent;
import org.apache.commons.collections.MapUtils;
import org.delta.activiti.BpmnJsonParser;

import java.util.Map;

/**
 * User: Alex
 * Date: 13-5-17
 * Time: 下午5:55
 */
public class StartEventParser extends BpmnJsonParser {
    @Override
    public String[] getXtypes() {
        return new String[]{"nonestart", "timerstart", "errorstart", "msgstart"};
    }

    @Override
    public StartEvent doParse(Map jsonMap, BaseElement parent, BpmnModel bpmnModel) {
        String xtype = MapUtils.getString(jsonMap, "xtype");
        StartEvent startEvent = new StartEvent();

        String formKey = MapUtils.getString(jsonMap, ATTRIBUTE_FORM_FORMKEY);
        String initiator = MapUtils.getString(jsonMap, ATTRIBUTE_EVENT_START_INITIATOR);

        startEvent.setFormKey(formKey);
        startEvent.setInitiator(initiator);

        return startEvent;
    }
}

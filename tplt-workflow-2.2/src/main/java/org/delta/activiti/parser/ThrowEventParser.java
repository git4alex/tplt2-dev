package org.delta.activiti.parser;

import org.activiti.bpmn.model.BaseElement;
import org.activiti.bpmn.model.BpmnModel;
import org.activiti.bpmn.model.ThrowEvent;
import org.delta.activiti.BpmnJsonParser;

import java.util.Map;

/**
 * User: Alex
 * Date: 13-5-24
 * Time: 下午5:27
 */
public class ThrowEventParser extends BpmnJsonParser {
    @Override
    public String[] getXtypes() {
        return new String[]{"internone","intersignalthrow"};
    }

    @Override
    protected BaseElement doParse(Map jsonMap, BaseElement parent, BpmnModel bpmnModel) {
        return new ThrowEvent();
    }
}

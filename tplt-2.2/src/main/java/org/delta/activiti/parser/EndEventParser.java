package org.delta.activiti.parser;

import org.activiti.bpmn.model.BaseElement;
import org.activiti.bpmn.model.BpmnModel;
import org.activiti.bpmn.model.EndEvent;
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
        return new EndEvent();
    }
}

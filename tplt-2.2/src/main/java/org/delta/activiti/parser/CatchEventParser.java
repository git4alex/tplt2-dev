package org.delta.activiti.parser;

import org.activiti.bpmn.model.BaseElement;
import org.activiti.bpmn.model.BpmnModel;
import org.activiti.bpmn.model.IntermediateCatchEvent;
import org.delta.activiti.BpmnJsonParser;

import java.util.Map;

/**
 * User: Alex
 * Date: 13-5-24
 * Time: 下午5:28
 */
public class CatchEventParser extends BpmnJsonParser {
    @Override
    public String[] getXtypes() {
        return new String[]{"intersignalcatch","intermsg","intertimer"};
    }

    @Override
    protected BaseElement doParse(Map jsonMap, BaseElement parent, BpmnModel bpmnModel) {
        return new IntermediateCatchEvent();
    }
}

package org.delta.activiti.parser;

import org.activiti.bpmn.model.BaseElement;
import org.activiti.bpmn.model.BpmnModel;
import org.activiti.bpmn.model.ManualTask;
import org.delta.activiti.BpmnJsonParser;

import java.util.Map;

/**
 * User: Alex
 * Date: 13-5-19
 * Time: 下午9:00
 */
public class ManualTaskParser extends BpmnJsonParser {
    @Override
    public String[] getXtypes() {
        return new String[]{"manualtask"};
    }

    @Override
    protected BaseElement doParse(Map jsonMap, BaseElement parent, BpmnModel bpmnModel) {
        return new ManualTask();
    }
}

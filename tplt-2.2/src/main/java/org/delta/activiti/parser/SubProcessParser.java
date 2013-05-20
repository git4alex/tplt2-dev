package org.delta.activiti.parser;

import org.activiti.bpmn.model.*;
import org.activiti.bpmn.model.Process;
import org.apache.commons.collections.MapUtils;
import org.apache.commons.lang.StringUtils;
import org.delta.activiti.BpmnJsonParser;

import java.util.Map;

/**
 * User: Alex
 * Date: 13-5-18
 * Time: 下午8:46
 */
public class SubProcessParser extends BpmnJsonParser {
    @Override
    public String[] getXtypes() {
        return new String[]{"subprocess"};
    }

    @Override
    public SubProcess doParse(Map jsonMap, BaseElement parent, BpmnModel bpmnModel) {
        Process currentProcess = (Process) parent;

        SubProcess subProcess = null;
        boolean triggerByEvent = MapUtils.getBoolean(jsonMap, ATTRIBUTE_TRIGGERED_BY);
        if (triggerByEvent) {
            subProcess = new EventSubProcess();
        } else {
            subProcess = new SubProcess();
        }

        String defaultFlow = MapUtils.getString(jsonMap, ATTRIBUTE_DEFAULT);
        if (StringUtils.isNotBlank(defaultFlow)) {
            subProcess.setDefaultFlow(defaultFlow);
        }

        currentProcess.addFlowElement(subProcess);
        jsonMap.put("parent", subProcess);

        return subProcess;
    }
}

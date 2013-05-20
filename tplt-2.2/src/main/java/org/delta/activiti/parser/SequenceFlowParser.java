package org.delta.activiti.parser;

import org.activiti.bpmn.model.BaseElement;
import org.activiti.bpmn.model.BpmnModel;
import org.activiti.bpmn.model.SequenceFlow;
import org.apache.commons.collections.MapUtils;
import org.delta.activiti.BpmnJsonParser;
import org.springframework.util.Assert;

import java.util.Map;

/**
 * User: Alex
 * Date: 13-5-20
 * Time: 上午8:49
 */
public class SequenceFlowParser extends BpmnJsonParser {
    @Override
    public String[] getXtypes() {
        return new String[]{"sequenceflow"};
    }

    @Override
    protected BaseElement doParse(Map jsonMap, BaseElement parent, BpmnModel bpmnModel) {
        SequenceFlow sequenceFlow = new SequenceFlow();
        String srcRef = MapUtils.getString(jsonMap, ATTRIBUTE_FLOW_SOURCE_REF);
        Assert.notNull(srcRef, "sourceRef is required for sequenceFlow");
        sequenceFlow.setSourceRef(srcRef);

        String tgtRef = MapUtils.getString(jsonMap,ATTRIBUTE_FLOW_TARGET_REF);
        Assert.notNull(srcRef, "targetRef is required for sequenceFlow");
        sequenceFlow.setTargetRef(tgtRef);

        sequenceFlow.setConditionExpression(MapUtils.getString(jsonMap,ELEMENT_FLOW_CONDITION));
        return sequenceFlow;
    }
}

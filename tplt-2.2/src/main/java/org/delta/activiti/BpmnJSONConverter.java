package org.delta.activiti;

import org.activiti.bpmn.constants.BpmnXMLConstants;
import org.activiti.bpmn.model.*;
import org.activiti.bpmn.model.Process;
import org.apache.commons.collections.CollectionUtils;
import org.apache.commons.collections.MapUtils;
import org.apache.commons.lang.ArrayUtils;
import org.apache.commons.lang.StringUtils;
import org.codehaus.jackson.JsonParser;
import org.codehaus.jackson.map.ObjectMapper;
import org.delta.activiti.parser.*;
import org.springframework.util.Assert;

import java.io.IOException;
import java.util.Collection;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * User: Alex
 * Date: 13-5-12
 * Time: 上午9:39
 */
public class BpmnJsonConverter implements BpmnXMLConstants {
    private Map<String, BpmnJsonParser> parserMap = new HashMap<String, BpmnJsonParser>();

    public BpmnJsonConverter(){
        addParser(new ProcessParser());
        addParser(new SubProcessParser());
        addParser(new StartEventParser());
        addParser(new EndEventParser());
        addParser(new UserTaskParser());
        addParser(new ServiceTaskParser());
        addParser(new ScriptTaskPaser());
        addParser(new SequenceFlowParser());
        addParser(new GatewayParser());
        addParser(new CatchEventParser());
        addParser(new ThrowEventParser());
    }

    private void addParser(BpmnJsonParser parser){
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

            for (Process process : bpmnModel.getProcesses()) {
                processFlowElements(process.getFlowElements(), process);
            }
        } catch (IOException e) {
            e.printStackTrace();
        }
        return bpmnModel;
    }

    private void processFlowElements(Collection<FlowElement> flowElementList, BaseElement parentScope) {
        for (FlowElement flowElement : flowElementList) {
            if (flowElement instanceof SequenceFlow) {
                SequenceFlow sequenceFlow = (SequenceFlow) flowElement;
                FlowNode sourceNode = getFlowNodeFromScope(sequenceFlow.getSourceRef(), parentScope);
                if (sourceNode != null) {
                    sourceNode.getOutgoingFlows().add(sequenceFlow);
                }
                FlowNode targetNode = getFlowNodeFromScope(sequenceFlow.getTargetRef(), parentScope);
                if (targetNode != null) {
                    targetNode.getIncomingFlows().add(sequenceFlow);
                }
            } else if(flowElement instanceof SubProcess) {
                SubProcess subProcess = (SubProcess) flowElement;
                processFlowElements(subProcess.getFlowElements(), subProcess);
            }
        }
    }

    private FlowNode getFlowNodeFromScope(String elementId, BaseElement scope) {
        FlowNode flowNode = null;
        if (StringUtils.isNotEmpty(elementId)) {
            if (scope instanceof Process) {
                flowNode = (FlowNode) ((Process) scope).getFlowElement(elementId);
            } else if (scope instanceof SubProcess) {
                flowNode = (FlowNode) ((SubProcess) scope).getFlowElement(elementId);
            }
        }
        return flowNode;
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

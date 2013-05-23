package org.delta.activiti.parser;

import org.activiti.bpmn.model.*;
import org.apache.commons.collections.MapUtils;
import org.delta.activiti.BpmnJsonParser;

import java.util.Map;

/**
 * User: Alex
 * Date: 13-5-23
 * Time: 上午9:48
 */
public class GatewayParser extends BpmnJsonParser {
    @Override
    public String[] getXtypes() {
        return new String[]{"gatewayxor","gatewayor","gatewayand"};
    }

    @Override
    protected BaseElement doParse(Map jsonMap, BaseElement parent, BpmnModel bpmnModel) {
        String xtype = MapUtils.getString(jsonMap,"xtype");
        if("gatewayxor".equalsIgnoreCase(xtype)){
            return new ExclusiveGateway();
        }else if("gatewayor".equalsIgnoreCase(xtype)){
            return new InclusiveGateway();
        }else if("gatewayand".equalsIgnoreCase(xtype)){
            return new ParallelGateway();
        }
        return null;
    }
}

package org.delta.activiti.parser;

import org.activiti.bpmn.model.BaseElement;
import org.activiti.bpmn.model.BpmnModel;
import org.activiti.bpmn.model.ServiceTask;
import org.apache.commons.collections.MapUtils;
import org.apache.commons.lang.StringUtils;
import org.delta.activiti.BpmnJsonParser;
import org.springframework.util.Assert;

import java.util.Map;

/**
 * User: Alex
 * Date: 13-5-18
 * Time: 下午10:56
 */
public class ServiceTaskParser extends BpmnJsonParser {
    @Override
    public String[] getXtypes() {
        return new String[]{"servicetask"};
    }

    @Override
    protected BaseElement doParse(Map jsonMap, BaseElement parent, BpmnModel bpmnModel) {
        ServiceTask st = new ServiceTask();
        String type = MapUtils.getString(jsonMap, "type");

        Assert.isNull(type, "'type' is required for service task");
        String expression = MapUtils.getString(jsonMap, "expression");
        Assert.isNull(type, "'expression' is required for service task");

        st.setImplementationType(type);
        st.setImplementation(expression);

        String resultVariable = MapUtils.getString(jsonMap,"resultVariable");
        st.setResultVariableName(resultVariable);

        Assert.isTrue(StringUtils.isNotBlank(resultVariable) && !ATTRIBUTE_TASK_SERVICE_EXPRESSION.equalsIgnoreCase(type),
                "'resultVariableName' not supported for service tasks using 'class' or 'delegateExpression'");

        return st;
    }
}

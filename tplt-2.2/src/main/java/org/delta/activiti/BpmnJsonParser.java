package org.delta.activiti;

import org.activiti.bpmn.constants.BpmnXMLConstants;
import org.activiti.bpmn.model.*;
import org.apache.commons.collections.CollectionUtils;
import org.apache.commons.collections.MapUtils;
import org.apache.commons.lang.StringUtils;
import org.springframework.util.Assert;

import java.util.List;
import java.util.Map;

/**
 * User: Alex
 * Date: 13-5-17
 * Time: 下午5:27
 */
public abstract class BpmnJsonParser implements BpmnXMLConstants {
    public abstract String[] getXtypes();

    protected abstract BaseElement doParse(Map jsonMap, BaseElement parent, BpmnModel bpmnModel);

    public BaseElement parse(Map jsonMap, BpmnModel bpmnModel) {
        BaseElement parent = (BaseElement) MapUtils.getObject(jsonMap, "parent");

        BaseElement el = doParse(jsonMap, parent, bpmnModel);

        if (el instanceof HasExecutionListeners) {
            List execListeners = (List) MapUtils.getObject(jsonMap, "executionListener");
            if (CollectionUtils.isNotEmpty(execListeners)) {
                for (Object item : execListeners) {
                    Map mapItem = (Map) item;
                    ((HasExecutionListeners) el).getExecutionListeners().add(parseListener(mapItem));
                }
            }
        }

        return el;
    }

    protected ActivitiListener parseListener(Map jsonMap) {
        ActivitiListener listener = new ActivitiListener();
        String event = MapUtils.getString(jsonMap, "event");
        Assert.isNull(event, "'event' is required for activiti listener");
        listener.setEvent(event);

        String type = MapUtils.getString(jsonMap, "type");
        Assert.isNull(type, "'type' is required for acitviti listener");
        String expression = MapUtils.getString(jsonMap, "expression");
        Assert.isNull(type, "'expression' is required for acitviti listener");

        listener.setImplementationType(type);
        listener.setImplementation(expression);

        List fieldExtensions = (List) MapUtils.getObject(jsonMap, "fieldExtensions");
        if (CollectionUtils.isNotEmpty(fieldExtensions)) {
            for (Object item : fieldExtensions) {
                Map itemMap = (Map) item;
                FieldExtension fe = parseFieldExtension(itemMap);
                listener.getFieldExtensions().add(fe);
            }
        }

        return listener;
    }

    protected FieldExtension parseFieldExtension(Map jsonMap) {
        FieldExtension fe = new FieldExtension();
        String name = MapUtils.getString(jsonMap, ATTRIBUTE_FIELD_NAME);
        Assert.isNull(name, "'name' is required for feild extension");
        fe.setFieldName(name);

        String valueString = MapUtils.getString(jsonMap, ATTRIBUTE_FIELD_STRING);
        if (StringUtils.isNotEmpty(valueString)) {
            fe.setStringValue(valueString);
        }
        String expression = MapUtils.getString(jsonMap, ATTRIBUTE_FIELD_EXPRESSION);
        if (StringUtils.isNotEmpty(expression)) {
            fe.setExpression(expression);
        }
        return fe;
    }
}

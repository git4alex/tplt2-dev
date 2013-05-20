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

        String id = MapUtils.getString(jsonMap, ATTRIBUTE_ID);
        Assert.notNull(id, "'id' is requided for:" + el.toString());
        el.setId(id);

        if (el instanceof HasExecutionListeners) {
            List execListeners = (List) MapUtils.getObject(jsonMap, "executionListener");
            if (CollectionUtils.isNotEmpty(execListeners)) {
                for (Object item : execListeners) {
                    Map mapItem = (Map) item;
                    ((HasExecutionListeners) el).getExecutionListeners().add(parseListener(mapItem));
                }
            }
        }

        if (el instanceof FlowElement) {
            ((FlowElement) el).setName(MapUtils.getString(jsonMap, ATTRIBUTE_NAME));
            if(parent instanceof FlowElementsContainer){
                ((FlowElementsContainer) parent).addFlowElement((FlowElement)el);
            }
        }

        if (el instanceof Activity) {
            if (jsonMap.containsKey(ATTRIBUTE_ACTIVITY_ASYNCHRONOUS)) {
                boolean async = MapUtils.getBoolean(jsonMap, ATTRIBUTE_ACTIVITY_ASYNCHRONOUS, false);
                ((Activity) el).setAsynchronous(async);
            }

            if (jsonMap.containsKey(ATTRIBUTE_ACTIVITY_EXCLUSIVE)) {
                boolean exclusive = MapUtils.getBoolean(jsonMap, ATTRIBUTE_ACTIVITY_EXCLUSIVE, false);
                ((Activity) el).setNotExclusive(!exclusive);
            }

            String collection = MapUtils.getString(jsonMap, ATTRIBUTE_MULTIINSTANCE_COLLECTION);
            String elementVariable = MapUtils.getString(jsonMap, ATTRIBUTE_MULTIINSTANCE_VARIABLE);
            String loopCardinality = MapUtils.getString(jsonMap, ELEMENT_MULTIINSTANCE_CARDINALITY);
            String complateCondition = MapUtils.getString(jsonMap, ELEMENT_MULTIINSTANCE_CONDITION);
            String inputDataItem = MapUtils.getString(jsonMap, ELEMENT_MULTIINSTANCE_DATAITEM);
            if (StringUtils.isNotBlank(collection)
                    || StringUtils.isNotBlank(elementVariable)
                    || StringUtils.isNotBlank(loopCardinality)
                    || StringUtils.isNotBlank(complateCondition)
                    || StringUtils.isNotBlank(inputDataItem)) {

                MultiInstanceLoopCharacteristics multiInstanceDef = new MultiInstanceLoopCharacteristics();
                boolean sequential = MapUtils.getBoolean(jsonMap, ATTRIBUTE_MULTIINSTANCE_SEQUENTIAL, false);
                multiInstanceDef.setSequential(sequential);
                multiInstanceDef.setInputDataItem(collection);
                multiInstanceDef.setElementVariable(elementVariable);
                multiInstanceDef.setLoopCardinality(loopCardinality);
                multiInstanceDef.setCompletionCondition(complateCondition);
                multiInstanceDef.setInputDataItem(inputDataItem);

                ((Activity) el).setLoopCharacteristics(multiInstanceDef);
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

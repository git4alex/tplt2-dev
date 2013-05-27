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
            List execListeners = (List) MapUtils.getObject(jsonMap, "listeners");
            if (CollectionUtils.isNotEmpty(execListeners)) {
                for (Object item : execListeners) {
                    Map mapItem = (Map) item;
                    String xtype = MapUtils.getString(mapItem,"xtype");
                    if(ELEMENT_EXECUTION_LISTENER.equalsIgnoreCase(xtype)){
                        ((HasExecutionListeners) el).getExecutionListeners().add(parseListener(mapItem));
                    }
                }
            }
        }

        if (el instanceof FlowElement) {
            ((FlowElement) el).setName(MapUtils.getString(jsonMap, ATTRIBUTE_NAME));
            if (parent instanceof FlowElementsContainer) {
                ((FlowElementsContainer) parent).addFlowElement((FlowElement) el);
            }
        }

        if (el instanceof Activity) {
            parseMultiInstanceLoopCharacteristics(jsonMap,(Activity)el);

            List boundaryEvents = (List) MapUtils.getObject(jsonMap,"boundaryEvents");
            if(CollectionUtils.isNotEmpty(boundaryEvents)){
                for(Object item:boundaryEvents){
                    Map mapItem=(Map)item;
                    BoundaryEvent boundaryEvent = parseBoundaryEvent(mapItem);
                    boundaryEvent.setAttachedToRefId(el.getId());
                    boundaryEvent.setAttachedToRef((Activity)el);
                    if (parent instanceof FlowElementsContainer) {
                        ((FlowElementsContainer) parent).addFlowElement(boundaryEvent);
                    }
                }
            }
        }

        if (el instanceof Event) {
            String eventType = MapUtils.getString(jsonMap, "eventType");
            if (StringUtils.isNotBlank(eventType)) {
                EventDefinition eventDefinition = parseEventDefination(jsonMap, eventType, (Event) el);
                if(eventDefinition != null){
                    ((Event) el).getEventDefinitions().add(eventDefinition);
                }
            }
        }

        return el;
    }

    protected BoundaryEvent parseBoundaryEvent(Map jsonMap){
        BoundaryEvent boundaryEvent = new BoundaryEvent();
        boolean cancelActivity= MapUtils.getBoolean(jsonMap,ATTRIBUTE_BOUNDARY_CANCELACTIVITY,false);
        boundaryEvent.setCancelActivity(cancelActivity);

        String eventType = MapUtils.getString(jsonMap,"eventType");
        EventDefinition eventDefinition = parseEventDefination(jsonMap,eventType,boundaryEvent);
        if(eventDefinition != null){
            boundaryEvent.getEventDefinitions().add(eventDefinition);
        }

        if (eventDefinition instanceof ErrorEventDefinition) {
            boundaryEvent.setCancelActivity(false);
        }
        return boundaryEvent;
    }

    protected void parseMultiInstanceLoopCharacteristics(Map jsonMap,Activity el){
        if (jsonMap.containsKey(ATTRIBUTE_ACTIVITY_ASYNCHRONOUS)) {
            boolean async = MapUtils.getBoolean(jsonMap, ATTRIBUTE_ACTIVITY_ASYNCHRONOUS, false);
            el.setAsynchronous(async);
        }

        if (jsonMap.containsKey(ATTRIBUTE_ACTIVITY_EXCLUSIVE)) {
            boolean exclusive = MapUtils.getBoolean(jsonMap, ATTRIBUTE_ACTIVITY_EXCLUSIVE, false);
            el.setNotExclusive(!exclusive);
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

            el.setLoopCharacteristics(multiInstanceDef);
        }
    }

    protected EventDefinition parseEventDefination(Map jsonMap, String eventType, Event event) {
        if ("timer".equalsIgnoreCase(eventType)) {
            TimerEventDefinition ed = new TimerEventDefinition();
            String timerType = MapUtils.getString(jsonMap, ATTRIBUTE_TYPE);
            Assert.notNull(timerType, "'timerType' is required for a timer event");

            String expression = MapUtils.getString(jsonMap, "expression");
            Assert.notNull(expression, "'expression' is required for a timer event");

            if (ATTRIBUTE_TIMER_DATE.equalsIgnoreCase(timerType)) {
                ed.setTimeDate(expression);
            } else if (ATTRIBUTE_TIMER_DURATION.equalsIgnoreCase(timerType)) {
                ed.setTimeDuration(expression);
            } else if (ATTRIBUTE_TIMER_CYCLE.equalsIgnoreCase(timerType)) {
                ed.setTimeCycle(expression);
            }

            return ed;
        } else if ("error".equalsIgnoreCase(eventType)) {
            ErrorEventDefinition ed = new ErrorEventDefinition();
            String errorRef = MapUtils.getString(jsonMap, ATTRIBUTE_ERROR_REF);
            Assert.hasText(errorRef,"'errorRef' is required for an error event");

            ed.setErrorCode(errorRef);

            if (event instanceof BoundaryEvent) {
                ((BoundaryEvent) event).setCancelActivity(false);
            }

            return ed;
        } else if ("message".equalsIgnoreCase(eventType)) {
            MessageEventDefinition ed = new MessageEventDefinition();
            String msgRef = MapUtils.getString(jsonMap, ATTRIBUTE_MESSAGE_REF);
            Assert.notNull(msgRef, "'msgref' is required for a message event");
            ed.setMessageRef(msgRef);

            return ed;
        } else if ("signal".equalsIgnoreCase(eventType)) {
            SignalEventDefinition eventDefinition = new SignalEventDefinition();
            String signalRef = MapUtils.getString(jsonMap, ATTRIBUTE_SIGNAL_REF);
            Assert.notNull(signalRef, "'signalref' is reauired for a signal event");
            eventDefinition.setSignalRef(signalRef);
            eventDefinition.setAsync(MapUtils.getBoolean(jsonMap, ATTRIBUTE_ACTIVITY_ASYNCHRONOUS,false));

            return eventDefinition;
        } else if ("cancel".equalsIgnoreCase(eventType)) {
            return new CancelEventDefinition();
        }

        return null;
    }

    protected ActivitiListener parseListener(Map jsonMap) {
        ActivitiListener listener = new ActivitiListener();
        String event = MapUtils.getString(jsonMap, ATTRIBUTE_LISTENER_EVENT);
        Assert.notNull(event, "'event' is required for activiti listener");
        listener.setEvent(event);

        String type = MapUtils.getString(jsonMap, ATTRIBUTE_TYPE);
        Assert.notNull(type, "'type' is required for acitviti listener");
        String expression = MapUtils.getString(jsonMap, "expression");
        Assert.notNull(type, "'expression' is required for acitviti listener");

        listener.setImplementationType(type);
        listener.setImplementation(expression);

        List fieldExtensions = (List) MapUtils.getObject(jsonMap, "fields");
        if (CollectionUtils.isNotEmpty(fieldExtensions)) {
            for (Object item : fieldExtensions) {
                Map itemMap = (Map) item;
                FieldExtension fe = parseField(itemMap);
                listener.getFieldExtensions().add(fe);
            }
        }

        return listener;
    }

    protected FieldExtension parseField(Map jsonMap) {
        FieldExtension fe = new FieldExtension();
        String name = MapUtils.getString(jsonMap, ATTRIBUTE_FIELD_NAME);
        Assert.notNull(name, "'name' is required for feild extension");
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

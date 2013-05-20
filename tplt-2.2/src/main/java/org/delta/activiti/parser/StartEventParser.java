package org.delta.activiti.parser;

import org.activiti.bpmn.model.*;
import org.apache.commons.collections.MapUtils;
import org.delta.activiti.BpmnJsonParser;
import org.springframework.util.Assert;

import java.util.Map;

/**
 * User: Alex
 * Date: 13-5-17
 * Time: 下午5:55
 */
public class StartEventParser extends BpmnJsonParser {
    @Override
    public String[] getXtypes() {
        return new String[]{"nonestart", "timerstart", "errorstart", "msgstart"};
    }

    @Override
    public StartEvent doParse(Map jsonMap, BaseElement parent, BpmnModel bpmnModel) {
        String xtype = MapUtils.getString(jsonMap, "xtype");
        StartEvent startEvent = new StartEvent();

        String formKey = MapUtils.getString(jsonMap, ATTRIBUTE_FORM_FORMKEY);
        String initiator = MapUtils.getString(jsonMap, ATTRIBUTE_EVENT_START_INITIATOR);

        startEvent.setFormKey(formKey);
        startEvent.setInitiator(initiator);

        if ("timerstart".equalsIgnoreCase(xtype)) {
            TimerEventDefinition ed = new TimerEventDefinition();
            String timerType = MapUtils.getString(jsonMap, "type");
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

            startEvent.getEventDefinitions().add(ed);
        } else if ("errorstart".equalsIgnoreCase(xtype)) {
            ErrorEventDefinition ed = new ErrorEventDefinition();
            String errorCode = MapUtils.getString(jsonMap, "errorRef");
            ed.setErrorCode(errorCode);

            startEvent.getEventDefinitions().add(ed);
        } else if ("msgstart".equalsIgnoreCase(xtype)) {
            MessageEventDefinition ed = new MessageEventDefinition();
            String msgRef = MapUtils.getString(jsonMap, ATTRIBUTE_MESSAGE_REF);
            Assert.isNull(msgRef, "'msgref' is required for a message event");
            ed.setMessageRef(msgRef);

            startEvent.getEventDefinitions().add(ed);

            if (!bpmnModel.containsMessageId(ed.getMessageRef())) {
                bpmnModel.addProblem("Invalid 'messageRef': no message with id '" + ed.getMessageRef() + "' found.", startEvent);
            }
        }
        return startEvent;
    }
}

package org.delta.activiti;

import org.activiti.engine.impl.bpmn.parser.BpmnParse;
import org.activiti.engine.impl.bpmn.parser.BpmnParser;
import org.activiti.engine.impl.cfg.BpmnParseFactory;
import org.springframework.stereotype.Component;

/**
 * User: Alex
 * Date: 13-5-20
 * Time: 下午12:49
 */
@Component
public class TpltParseFactory implements BpmnParseFactory{
    @Override
    public BpmnParse createBpmnParse(BpmnParser bpmnParser) {
        return new TpltParse(bpmnParser);
    }
}

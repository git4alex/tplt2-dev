package org.delta.activiti;

import org.activiti.bpmn.converter.BpmnXMLConverter;
import org.activiti.bpmn.model.BpmnModel;
import org.activiti.engine.impl.bpmn.deployer.BpmnDeployer;
import org.activiti.engine.impl.bpmn.parser.BpmnParse;
import org.activiti.engine.impl.bpmn.parser.BpmnParser;
import org.activiti.engine.impl.context.Context;
import org.activiti.engine.impl.interceptor.Command;
import org.activiti.engine.impl.interceptor.CommandContext;
import org.activiti.engine.impl.persistence.entity.DeploymentEntity;

import java.io.ByteArrayInputStream;

/**
 * User: Alex
 * Date: 13-5-20
 * Time: 下午6:50
 */
public class ConvertCmd implements Command {
    private String jsonDef;
    public ConvertCmd(String jsonDef){
        this.jsonDef = jsonDef;
    }
    @Override
    public Object execute(CommandContext commandContext) {
        BpmnDeployer deployer = Context.getProcessEngineConfiguration().getBpmnDeployer();
        BpmnParser parser = deployer.getBpmnParser();
        BpmnParse bpmnParse = parser.createParse()
                .sourceInputStream(new ByteArrayInputStream(jsonDef.getBytes()))
                .deployment(new DeploymentEntity());
        bpmnParse.execute();
        BpmnModel bm = bpmnParse.getBpmnModel();
        BpmnXMLConverter xmlConverter = new BpmnXMLConverter();
        return new String(xmlConverter.convertToXML(bm));
    }
}
